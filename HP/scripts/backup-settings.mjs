#!/usr/bin/env node
/**
 * 本番サイトの設定データ（store_settings）を丸ごとバックアップする。
 *
 * 2026-08-14 に「古い状態のブラウザが本番DBを上書きし、7月に追加したメニューが
 * 消える」事故が起きた。DBは上書き方式で履歴を持たないため、気づくまで復元手段が
 * 何もなかった。このスクリプトはその保険。
 *
 * 特徴:
 *   - 接続先を決め打ちしない。実際に公開中のバンドルを読んで「本番が今どのDBを
 *     見ているか」を突き止めてからバックアップする。DBが切り替わっても追従する。
 *   - 前回バックアップと比べてメニュー件数が大きく減っていたら警告する（早期発見）。
 *
 * 使い方:  node scripts/backup-settings.mjs
 */

import { writeFile, readFile, readdir, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const SITE = 'https://kabuki-sushi.co.jp'
const BACKUP_DIR = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', 'HPバックアップ')
const KEEP = 60
/** 前回より項目数がこの割合以上減っていたら警告する */
const DROP_ALERT_RATIO = 0.1

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

  return { url, key, bundle: asset }
}

/** メニュー項目数を数えて、消失に気づけるようにする */
function countItems(rows) {
  const counts = {}
  for (const row of rows) {
    if (row.settings_type !== 'text') continue
    for (const [sectionId, fields] of Object.entries(row.data || {})) {
      if (typeof fields !== 'object' || fields === null) continue
      for (const key of Object.keys(fields)) {
        const m = key.match(/^([a-z]+)_(\d+)_name$/)
        if (m) counts[`${row.store_id}/${sectionId}/${m[1]}`] = (counts[`${row.store_id}/${sectionId}/${m[1]}`] || 0) + 1
      }
    }
  }
  return counts
}

async function previousBackup() {
  try {
    const files = (await readdir(BACKUP_DIR)).filter(f => f.endsWith('_本番DB.json')).sort()
    if (!files.length) return null
    return { name: files[files.length - 1], body: JSON.parse(await readFile(join(BACKUP_DIR, files[files.length - 1]), 'utf8')) }
  } catch { return null }
}

async function main() {
  await mkdir(BACKUP_DIR, { recursive: true })

  const db = await resolveProductionDb()
  const res = await fetch(`${db.url}/rest/v1/store_settings?select=*`, {
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
  })
  if (!res.ok) throw new Error(`DBの読み取りに失敗しました (HTTP ${res.status})`)

  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('DBが空です。バックアップを中止しました')

  const counts = countItems(rows)
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const name = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}_本番DB.json`

  const prev = await previousBackup()
  const warnings = []

  if (prev?.body?.database?.url && prev.body.database.url !== db.url) {
    warnings.push(`本番の接続先DBが変わっています: ${prev.body.database.url} → ${db.url}`)
  }
  if (prev?.body?.counts) {
    for (const [k, before] of Object.entries(prev.body.counts)) {
      const after = counts[k] || 0
      if (after < before * (1 - DROP_ALERT_RATIO)) warnings.push(`${k} が ${before}件 → ${after}件 に減っています`)
    }
  }

  await writeFile(
    join(BACKUP_DIR, name),
    JSON.stringify({ takenAt: now.toISOString(), database: db, counts, warnings, rows }, null, 2),
    'utf8'
  )

  console.log(`バックアップ: ${name}`)
  console.log(`接続先: ${db.url}（バンドル ${db.bundle}）`)
  console.log(`項目数: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (warnings.length) {
    console.log('\n⚠️  要確認')
    warnings.forEach(w => console.log(`  - ${w}`))
  } else {
    console.log('前回から不自然な減少はありません')
  }

  // 古いバックアップを間引く
  const files = (await readdir(BACKUP_DIR)).filter(f => f.endsWith('_本番DB.json')).sort()
  for (const f of files.slice(0, Math.max(0, files.length - KEEP))) await unlink(join(BACKUP_DIR, f))
}

main().catch(err => { console.error('バックアップ失敗:', err.message); process.exit(1) })
