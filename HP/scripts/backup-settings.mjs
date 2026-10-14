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
 *   - 取ったデータを check-settings.mjs で点検する（仮の文字・¥0・余計な書式・レジとの値段違い）。
 *   - 毎朝の自動実行（launchd）では、点検で問題が見つかった時・バックアップに失敗した時に、
 *     平良さんへ Slack の DM で知らせる（同じ内容は毎日は送らず、変わった時と7日ごと）。
 *
 * 使い方:  node scripts/backup-settings.mjs            # 手で取る（Slack には送らない）
 *          node scripts/backup-settings.mjs --notify   # 知らせる（launchd から動く時は自動でこちら）
 */

import { writeFile, readFile, readdir, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { checkSettings } from './check-settings.mjs'

const SITE = 'https://kabuki-sushi.co.jp'
const BACKUP_DIR = process.env.HP_BACKUP_DIR || join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', 'HPバックアップ')
/** 試すときは HP_NOTIFY_DRY_RUN=1 で、Slack に送らず画面に出すだけにする */
const DRY_RUN = process.env.HP_NOTIFY_DRY_RUN === '1'
/** 直近この日数のバックアップは全部残す */
const KEEP_ALL_DAYS = 30
/** それより古いものは1日1つ（その日の最後）だけ、この日数まで残す */
const KEEP_DAILY_DAYS = 180
/** 前回より項目数がこの割合以上減っていたら警告する */
const DROP_ALERT_RATIO = 0.1

/** launchd（毎朝5時）から動いているか、--notify が付いているときだけ Slack に送る */
const NOTIFY = process.argv.includes('--notify') || process.env.XPC_SERVICE_NAME === 'com.wabisuke.kabukisushi-hp-backup'
const BOT_MD = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', '自動化', 'slack', 'bot設定.md')
/** 平良さんの Slack ID（給与明細の自動送付と同じ宛先） */
const OWNER_SLACK_ID = 'U0BFA9ZNDPB'
const NOTICE_STATE = join(BACKUP_DIR, '_点検の通知記録.json')
const REMIND_AFTER_DAYS = 7
const ADMIN_URL = 'https://kabuki-sushi.co.jp/admin/editor'

/** バックアップのファイル名（YYYY-MM-DD_HHMM[SS]_本番DB.json）から日時を読む */
const BACKUP_NAME = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})?_本番DB\.json$/
function backupTime(name) {
  const m = name.match(BACKUP_NAME)
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) : null
}
async function backupFiles() {
  return (await readdir(BACKUP_DIR)).filter(f => BACKUP_NAME.test(f)).sort((a, b) => backupTime(a) - backupTime(b))
}

export async function slackDm(text) {
  if (DRY_RUN) { console.log(`[dry-run] Slack に送る内容:\n${text}`); return }
  const md = await readFile(BOT_MD, 'utf8')
  const token = md.match(/xoxb-[A-Za-z0-9-]+/)?.[0]
  if (!token) throw new Error('bot設定.md に Bot Token がありません')
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel: OWNER_SLACK_ID, text }),
  })
  const body = await res.json()
  if (!body.ok) throw new Error(`Slack への送信に失敗: ${body.error}`)
}

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
    const files = await backupFiles()
    if (!files.length) return null
    return { name: files[files.length - 1], body: JSON.parse(await readFile(join(BACKUP_DIR, files[files.length - 1]), 'utf8')) }
  } catch { return null }
}

/**
 * 古いバックアップを間引く。以前は「60個」で切っていたため、手で何度も取った日があると
 * 残る日数が縮んでいた（2026-10-15 時点で約45日分）。日数で決める。
 */
export async function pruneBackups(now) {
  const files = await backupFiles()
  const keepAllFrom = new Date(now.getTime() - KEEP_ALL_DAYS * 86400000)
  const keepDailyFrom = new Date(now.getTime() - KEEP_DAILY_DAYS * 86400000)
  const lastOfDay = new Map()
  for (const f of files) lastOfDay.set(f.slice(0, 10), f) // 時刻順なので、その日の最後が残る
  for (const f of files) {
    const t = backupTime(f)
    if (t >= keepAllFrom) continue
    if (t >= keepDailyFrom && lastOfDay.get(f.slice(0, 10)) === f) continue
    await unlink(join(BACKUP_DIR, f))
  }
}

/** 点検の結果を知らせる。前回知らせた内容と同じなら、7日たつまでは送らない */
export async function notifyProblems(problems, warnings, now) {
  let state = {}
  try { state = JSON.parse(await readFile(NOTICE_STATE, 'utf8')) } catch { }
  const keys = [...problems.map(p => p.key), ...warnings].sort()
  const same = JSON.stringify(keys) === JSON.stringify(state.keys || [])
  const stale = !state.sentAt || now - new Date(state.sentAt) > REMIND_AFTER_DAYS * 86400000
  if (!keys.length) {
    if (state.keys?.length) await writeFile(NOTICE_STATE, JSON.stringify({ keys: [], sentAt: null, clearedAt: now.toISOString() }, null, 2))
    return 'なし'
  }
  if (same && !stale) return '前回と同じ内容のため送らず'
  const lines = [
    `【寿司HPの毎朝点検】直したほうがいい所が${keys.length}件あります（${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}）`,
    ...warnings.map(w => `・${w}`),
    ...problems.slice(0, 30).map(p => `・${p.text}`),
    problems.length > 30 ? `・ほか${problems.length - 30}件` : null,
    `直す場所：${ADMIN_URL}`,
  ].filter(Boolean)
  await slackDm(lines.join('\n'))
  await writeFile(NOTICE_STATE, JSON.stringify({ keys, sentAt: now.toISOString() }, null, 2))
  return 'Slack で知らせました'
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
  // 秒まで入れる。分単位だと、同じ分に2回取ると前のファイルが上書きされていた（2026-10-15 に実際に起きた）
  const name = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_本番DB.json`

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

  // お客さんに見えている所の点検
  const { problems, notes } = await checkSettings(rows)
  if (problems.length) {
    console.log(`\n点検: 直したほうがいい所 ${problems.length}件`)
    problems.forEach(p => console.log(`  - ${p.text}`))
  } else {
    console.log(`\n点検: 直したほうがいい所はありません${notes.length ? `（参考 ${notes.length}件）` : ''}`)
  }
  if (NOTIFY) console.log(`通知: ${await notifyProblems(problems, warnings, now)}`)

  await pruneBackups(now)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(async err => {
  console.error('バックアップ失敗:', err.message)
  // 毎朝の自動実行で失敗したら、気づけるように知らせる（以前はログに残るだけだった）
  if (NOTIFY) {
    try { await slackDm(`【寿司HP】毎朝のバックアップに失敗しました：${err.message}\n本番のサイトやDBに問題が無いか確認してください。`) }
    catch (e) { console.error('Slack への通知にも失敗:', e.message) }
  }
  process.exit(1)
})
