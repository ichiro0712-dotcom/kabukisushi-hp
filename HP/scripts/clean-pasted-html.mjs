#!/usr/bin/env node
/**
 * 商品名・価格に紛れ込んだ「貼り付け由来の書式」を取り除く。
 *
 * 管理画面の入力欄は contentEditable で、貼り付け時に <font color face> や
 * Word/Pages の <p class="p1"> がコピー元から一緒に入る。データはそのまま HTML と
 * して描画されるため、その項目だけフォントと色が変わって表示されていた。
 * 貼り付け側は onPaste で書式なし固定にしたので、このスクリプトは既存データの掃除用。
 *
 * 対象は1行フィールド（*_name / *_name_en / *_name_ko / *_name_zh / *_name_sub /
 * *_price）だけ。説明文・本文（*_content, *_desc, *_note, *_caption 等）は <br> や
 * <div> が改行として機能しているので触らない。
 *
 * 使い方:
 *   node scripts/clean-pasted-html.mjs           # 差分を表示するだけ（書き込まない）
 *   node scripts/clean-pasted-html.mjs --apply   # 実際に本番DBへ書き込む
 *
 * 安全装置:
 *   - 実行前に必ず backup-settings.mjs を走らせること（--apply 時は自動で確認する）
 *   - 読み込んだ updated_at と一致する行だけ更新する（他端末の編集を踏み潰さない）
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const SITE = 'https://kabuki-sushi.co.jp'
const BACKUP_DIR = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', 'HPバックアップ')
const APPLY = process.argv.includes('--apply')

/** 掃除対象の1行フィールド */
const SINGLE_LINE_KEY = /_(name|name_en|name_ko|name_zh|name_sub|price)$/

/** 公開中のバンドルから、本番が実際に使っている Supabase の接続先を読み取る */
async function resolveProductionDb() {
  const html = await (await fetch(SITE, { cache: 'no-store' })).text()
  const asset = html.match(/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0]
  if (!asset) throw new Error('公開中のバンドルを特定できませんでした')

  const js = await (await fetch(`${SITE}/${asset}`)).text()
  const url = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0]
  const key = js.match(/["'](sb_publishable_[A-Za-z0-9_-]+)["']/)?.[1]
    || js.match(/["'](eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)["']/)?.[1]
  if (!url || !key) throw new Error('バンドルから Supabase の接続先を読み取れませんでした')

  return { url, key }
}

/**
 * 1行フィールドを素のテキストに戻す。
 * ブロック要素の切れ目は空白にしてから、残ったタグを落とす。
 * &nbsp; 以外の実体参照（&amp; など）は表示が変わらないのでそのまま残す。
 */
function toPlainText(html) {
  return html
    .replace(/<\/(div|p|h[1-6]|li|tr)\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/ /g, ' ')
    // 全角スペース(　)は意図的に使われることがあるので潰さない
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}

/** 変更の種類を判定して、目視確認しやすくする */
function classify(before, after) {
  if (after === '') return '空になる'

  // 元データが何行に見えていたか。2行以上なら1行に詰まる＝見た目が変わる
  const lines = before
    .split(/<br\s*\/?>|<\/(?:div|p|h[1-6]|li|tr)\s*>/i)
    .map(s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim())
    .filter(Boolean)
  if (lines.length > 1) return '改行が1行になる'

  if (/<(b|strong|i|em|u|font|span)\b/i.test(before)) return '装飾が外れる'
  return 'タグ除去のみ'
}

async function latestBackup() {
  try {
    const files = (await readdir(BACKUP_DIR)).filter(f => f.endsWith('_本番DB.json')).sort()
    return files[files.length - 1] || null
  } catch { return null }
}

async function main() {
  const db = await resolveProductionDb()
  const res = await fetch(`${db.url}/rest/v1/store_settings?select=*&settings_type=eq.text`, {
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
  })
  if (!res.ok) throw new Error(`DBの読み取りに失敗しました (HTTP ${res.status})`)

  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('DBが空です。処理を中止しました')

  const plans = []
  const skipped = []

  for (const row of rows) {
    const data = structuredClone(row.data || {})
    const changes = []

    for (const [sectionId, fields] of Object.entries(data)) {
      if (typeof fields !== 'object' || fields === null) continue
      for (const [key, val] of Object.entries(fields)) {
        if (typeof val !== 'string') continue
        if (!SINGLE_LINE_KEY.test(key)) continue
        const cleaned = toPlainText(val)
        if (cleaned === val) continue

        const kind = classify(val, cleaned)

        // 元が2行以上で表示されている項目は、詰めると公開中の見た目が変わる。
        // 書式ゴミの掃除とは別の判断なので自動では触らず、報告だけして人に委ねる。
        if (kind === '改行が1行になる') {
          skipped.push({ storeId: row.store_id, sectionId, key, before: val, after: cleaned })
          continue
        }

        fields[key] = cleaned
        changes.push({ sectionId, key, before: val, after: cleaned, kind })
      }
    }

    if (changes.length) plans.push({ storeId: row.store_id, updatedAt: row.updated_at, data, changes })
  }

  if (skipped.length) {
    console.log(`\n=== 見送り（要確認・${skipped.length}件）===`)
    console.log('現在2行で表示されている項目です。1行に詰めてよいか人が判断してください。')
    for (const s of skipped) {
      console.log(`[${s.storeId}/${s.sectionId}] ${s.key}`)
      console.log(`    現在: ${JSON.stringify(s.before)}`)
      console.log(`    候補: ${JSON.stringify(s.after)}`)
    }
  }

  const total = plans.reduce((n, p) => n + p.changes.length, 0)
  if (total === 0) {
    console.log('掃除対象はありませんでした。')
    return
  }

  // 目視確認しやすい順に出す
  const ORDER = ['装飾が外れる', 'タグ除去のみ', '空になる']
  for (const kind of ORDER) {
    const list = plans.flatMap(p => p.changes.filter(c => c.kind === kind).map(c => ({ ...c, storeId: p.storeId })))
    if (!list.length) continue
    console.log(`\n=== ${kind}（${list.length}件）===`)
    for (const c of list) {
      console.log(`[${c.storeId}/${c.sectionId}] ${c.key}`)
      console.log(`    前: ${JSON.stringify(c.before)}`)
      console.log(`    後: ${JSON.stringify(c.after)}`)
    }
  }

  console.log(`\n合計 ${total}件 / 対象行 ${plans.map(p => `${p.storeId}/text`).join(', ')}`)

  if (!APPLY) {
    console.log('\n--- dry-run です。書き込んでいません。実行するには --apply を付けてください ---')
    return
  }

  const backup = await latestBackup()
  if (!backup) throw new Error('バックアップが見つかりません。先に node scripts/backup-settings.mjs を実行してください')
  console.log(`\n直近のバックアップ: ${backup}`)

  for (const plan of plans) {
    // updated_at が読み込んだ時のままの行だけ更新する（他端末の編集を踏み潰さないため）
    const params = new URLSearchParams({
      store_id: `eq.${plan.storeId}`,
      settings_type: 'eq.text',
      updated_at: `eq.${plan.updatedAt}`,
    })
    const putRes = await fetch(`${db.url}/rest/v1/store_settings?${params}`, {
      method: 'PATCH',
      headers: {
        apikey: db.key,
        Authorization: `Bearer ${db.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ data: plan.data, updated_at: new Date().toISOString() }),
    })

    if (!putRes.ok) {
      console.error(`書き込み失敗 ${plan.storeId}: HTTP ${putRes.status} ${await putRes.text()}`)
      process.exitCode = 1
      continue
    }

    const updated = await putRes.json()
    if (!Array.isArray(updated) || updated.length === 0) {
      console.error(`中断 ${plan.storeId}: 読み込み後に他の端末がDBを更新しています。やり直してください`)
      process.exitCode = 1
      continue
    }

    console.log(`更新: ${plan.storeId}/text（${plan.changes.length}件）`)
  }
}

main().catch(err => { console.error('失敗:', err.message); process.exit(1) })
