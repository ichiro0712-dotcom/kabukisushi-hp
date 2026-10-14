#!/usr/bin/env node
/**
 * 本番の設定データ（store_settings の text 行）を、決めた項目だけ書き換える。
 *
 * 管理画面を使えないときの代わり。直す内容は JSON の「計画ファイル」に書き、
 * 1項目ずつ「今の値（from）」と「直した後の値（to）」を持たせる。
 *
 * 使い方:
 *   node scripts/patch-settings.mjs <計画ファイル.json>           # 差分を表示するだけ（書き込まない）
 *   node scripts/patch-settings.mjs <計画ファイル.json> --apply   # 本番DBへ書き込み、読み直して確かめる
 *
 * 計画ファイルの形:
 *   { "changes": [
 *       { "store": "honten", "section": "menu", "key": "nigiri_38_name_ko", "from": "새 메뉴", "to": "골뱅이" },
 *       { "store": "honten", "section": "drink", "key": "subtitle_en", "from": null, "to": "" },
 *       { "store": "honten", "section": "drink", "key": "other_content",
 *         "replace": { "find": "ジンジャーエール／500", "with": "ジンジャーエール／900" } }
 *   ] }
 *   from: null は「その項目がまだ無い」こと。replace は find がちょうど1回だけ現れる場合に置き換える。
 *
 * 安全装置:
 *   - 1項目でも今の値が from と違えば、何も書かずに止まる（誰かが先に直した・計画が古い）
 *   - --apply は30分以内のバックアップ（backup-settings.mjs）が無いと止まる
 *   - 読み込んだ updated_at と一致する行だけ更新する（他端末の編集を踏み潰さない）
 *   - 書き込み後に読み直し、計画の項目だけが変わったことを確かめる
 */

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const SITE = 'https://kabuki-sushi.co.jp'
const BACKUP_DIR = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', 'HPバックアップ')
const BACKUP_MAX_AGE_MS = 30 * 60 * 1000

const planPath = process.argv[2]
const APPLY = process.argv.includes('--apply')

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

async function fetchTextRows(db, storeIds) {
  const params = new URLSearchParams({
    select: 'store_id,settings_type,data,updated_at',
    settings_type: 'eq.text',
    store_id: `in.(${storeIds.join(',')})`,
  })
  const res = await fetch(`${db.url}/rest/v1/store_settings?${params}`, {
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
  })
  if (!res.ok) throw new Error(`DBの読み取りに失敗しました (HTTP ${res.status})`)
  const rows = await res.json()
  return Object.fromEntries(rows.map(r => [r.store_id, r]))
}

/** バックアップのファイル名（YYYY-MM-DD_HHMM[SS]_本番DB.json）から、30分以内のものがあるか */
async function recentBackup() {
  const time = f => { const m = f.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})?_本番DB\.json$/); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)).getTime() : NaN }
  const files = (await readdir(BACKUP_DIR)).filter(f => !Number.isNaN(time(f))).sort((a, b) => time(a) - time(b))
  const last = files[files.length - 1]
  if (!last) return null
  return Date.now() - time(last) <= BACKUP_MAX_AGE_MS ? last : null
}

const show = v => (v === undefined || v === null ? '（項目なし）' : JSON.stringify(v))

/** 計画を今のデータに当てはめる。ズレがあれば problems に積む */
function buildPlan(changes, rows) {
  const problems = []
  const next = {}
  const applied = []

  for (const c of changes) {
    const row = rows[c.store]
    if (!row) { problems.push(`${c.store}: text 行が見つかりません`); continue }
    next[c.store] ??= structuredClone(row.data)
    const section = (next[c.store][c.section] ??= {})
    const current = section[c.key]

    let after
    if (c.replace) {
      const count = typeof current === 'string' ? current.split(c.replace.find).length - 1 : 0
      if (count !== 1) { problems.push(`${c.store}/${c.section}/${c.key}: 「${c.replace.find}」が${count}回見つかりました（1回のはず）`); continue }
      after = current.replace(c.replace.find, c.replace.with)
    } else {
      const expected = c.from === null ? undefined : c.from
      if (current !== expected) { problems.push(`${c.store}/${c.section}/${c.key}: 今の値 ${show(current)} が計画の ${show(c.from)} と違います`); continue }
      after = c.to
    }

    section[c.key] = after
    applied.push({ ...c, before: current, after })
  }

  return { problems, next, applied }
}

/** 読み直した行が「計画の項目だけ変わった」状態か */
function verify(beforeRows, afterRows, applied) {
  const errors = []
  for (const storeId of Object.keys(afterRows)) {
    const before = beforeRows[storeId].data
    const after = afterRows[storeId].data
    const planned = new Map(applied.filter(a => a.store === storeId).map(a => [`${a.section}/${a.key}`, a.after]))
    const sections = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const s of sections) {
      const keys = new Set([...Object.keys(before[s] || {}), ...Object.keys(after[s] || {})])
      for (const k of keys) {
        const id = `${s}/${k}`
        const b = before[s]?.[k]
        const a = after[s]?.[k]
        if (planned.has(id)) {
          if (a !== planned.get(id)) errors.push(`${storeId}/${id}: 書いたはずの値になっていません ${show(a)}`)
        } else if (JSON.stringify(a) !== JSON.stringify(b)) {
          errors.push(`${storeId}/${id}: 計画に無い項目が変わっています ${show(b)} → ${show(a)}`)
        }
      }
    }
  }
  return errors
}

async function main() {
  if (!planPath) throw new Error('計画ファイルを指定してください（node scripts/patch-settings.mjs <計画ファイル.json>）')
  const plan = JSON.parse(await readFile(planPath, 'utf8'))
  const changes = plan.changes || []
  if (!changes.length) throw new Error('計画ファイルに changes がありません')

  const db = await resolveProductionDb()
  const storeIds = [...new Set(changes.map(c => c.store))]
  const rows = await fetchTextRows(db, storeIds)
  const { problems, next, applied } = buildPlan(changes, rows)

  for (const a of applied) {
    console.log(`[${a.store}/${a.section}] ${a.key}`)
    console.log(`    前: ${show(a.before)}`)
    console.log(`    後: ${show(a.after)}`)
  }
  const perStore = storeIds.map(s => `${s}=${applied.filter(a => a.store === s).length}件`).join(' / ')
  console.log(`\n合計 ${applied.length}件（${perStore}）`)

  if (problems.length) {
    console.log('\n⚠️  計画と今のデータが合わないので、何も書き込みません')
    problems.forEach(p => console.log(`  - ${p}`))
    process.exitCode = 1
    return
  }

  if (!APPLY) {
    console.log('\n--- dry-run です。書き込んでいません。実行するには --apply を付けてください ---')
    return
  }

  const backup = await recentBackup()
  if (!backup) throw new Error('30分以内のバックアップがありません。先に node scripts/backup-settings.mjs を実行してください')
  console.log(`\n直近のバックアップ: ${backup}`)

  for (const storeId of storeIds) {
    const params = new URLSearchParams({
      store_id: `eq.${storeId}`,
      settings_type: 'eq.text',
      updated_at: `eq.${rows[storeId].updated_at}`,
    })
    const res = await fetch(`${db.url}/rest/v1/store_settings?${params}`, {
      method: 'PATCH',
      headers: {
        apikey: db.key,
        Authorization: `Bearer ${db.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ data: next[storeId], updated_at: new Date().toISOString() }),
    })
    if (!res.ok) throw new Error(`書き込み失敗 ${storeId}: HTTP ${res.status} ${await res.text()}`)
    const updated = await res.json()
    if (!Array.isArray(updated) || updated.length === 0) {
      throw new Error(`中断 ${storeId}: 読み込んだ後に他の端末がDBを更新しています（ここまでに書いた店はそのまま）。やり直してください`)
    }
    console.log(`更新: ${storeId}/text（${applied.filter(a => a.store === storeId).length}件）`)
  }

  const reread = await fetchTextRows(db, storeIds)
  const errors = verify(rows, reread, applied)
  if (errors.length) {
    console.log('\n⚠️  読み直したら想定と違う所があります')
    errors.forEach(e => console.log(`  - ${e}`))
    process.exitCode = 1
    return
  }
  console.log(`\n読み直して確認: 計画の${applied.length}件だけが変わっています`)
}

main().catch(err => { console.error('失敗:', err.message); process.exit(1) })
