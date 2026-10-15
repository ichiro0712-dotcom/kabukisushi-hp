#!/usr/bin/env node
/**
 * 本番サイトの写真（Supabase Storage の store-images）を手元に丸ごと写す。
 *
 * 文字のデータは毎朝 backup-settings.mjs で取っているが、写真は対象外だった。
 * store-images は誰でも消したり差し替えたりできる設定のまま（2026-10-15 にダッシュボードで確認）
 * なので、消された時に戻せるよう、その時点の写真をすべて残す。
 *
 * 特徴:
 *   - 接続先は backup-settings.mjs と同じく、公開中のバンドルから読む（本番が今見ている DB）。
 *   - 読むだけ。本番の写真やデータは変えない。
 *   - 取るたびに日時のフォルダを新しく作る（前に取った分は上書きしない）。
 *   - 落とした後に、大きさと MD5（eTag）を本番の記録と突き合わせる。
 *   - DB（store_settings）が指している写真が全部入っているか、別のプロジェクトを指していないかも確かめる。
 *
 * 使い方:  node scripts/backup-images.mjs           # 取る
 *          node scripts/backup-images.mjs --list    # 枚数と大きさを見るだけ（何も保存しない）
 */

import { mkdir, writeFile, rename, readdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve, dirname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { BACKUP_DIR, resolveProductionDb } from './backup-settings.mjs'

const BUCKET = 'store-images'
const LIST_ONLY = process.argv.includes('--list')
const CONCURRENCY = 4
const TIMEOUT_MS = 60000
const PAGE = 1000

const authHeaders = key => ({ apikey: key, Authorization: `Bearer ${key}` })
const mb = bytes => `${(bytes / 1024 / 1024).toFixed(1)}MB`

async function listFolder(db, prefix) {
  const items = []
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${db.url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...authHeaders(db.key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    if (!res.ok) throw new Error(`写真の一覧を読めませんでした（${prefix || '一番上'}・HTTP ${res.status}）`)
    const page = await res.json()
    items.push(...page)
    if (page.length < PAGE) return items
  }
}

/** フォルダをたどって、すべてのファイルを集める（フォルダは id が null で返ってくる） */
async function listAll(db, prefix = '') {
  const files = []
  for (const item of await listFolder(db, prefix)) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id === null) files.push(...await listAll(db, path))
    else files.push({
      path,
      size: item.metadata?.size ?? null,
      mimetype: item.metadata?.mimetype || '',
      eTag: item.metadata?.eTag || '',
      updatedAt: item.updated_at,
    })
  }
  return files
}

/** 誰でも置ける場所なので、名前に「..」などが入っていても保存先の外に書かない */
function safeTarget(root, path) {
  const parts = path.split('/')
  if (parts.some(p => !p || p === '.' || p === '..' || p.includes('\0') || p.includes('\\'))) return null
  const target = resolve(root, ...parts)
  return target.startsWith(root + sep) ? target : null
}

async function download(db, path) {
  const url = `${db.url}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, { headers: authHeaders(db.key), signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (e) {
      lastError = e
      await new Promise(r => setTimeout(r, 1000 * attempt))
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error(lastError.message)
}

const STORAGE_URL = /https:\/\/([a-z0-9]+)\.supabase\.co\/storage\/v1\/object\/public\/store-images\/([^"'\s)<>?#]+)/g

/** DB の中で写真の URL が入っている所を全部拾う（どの店・どの欄か付きで） */
function referencedImages(rows) {
  const refs = []
  const walk = (value, where) => {
    if (typeof value === 'string') {
      for (const m of value.matchAll(STORAGE_URL)) {
        let path = m[2]
        try { path = decodeURIComponent(path) } catch { }
        refs.push({ project: m[1], path, where })
      }
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, where ? `${where}.${k}` : k)
    }
  }
  for (const row of rows) walk(row.data, `${row.store_id}/${row.settings_type}`)
  return refs
}

async function filesOnDisk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await filesOnDisk(full))
    else out.push({ full, size: (await stat(full)).size })
  }
  return out
}

async function main() {
  const db = await resolveProductionDb()
  const project = db.url.match(/^https:\/\/([a-z0-9]+)\./)[1]

  const files = await listAll(db)
  const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0)

  const res = await fetch(`${db.url}/rest/v1/store_settings?select=store_id,settings_type,data`, { headers: authHeaders(db.key) })
  if (!res.ok) throw new Error(`DBの読み取りに失敗しました (HTTP ${res.status})`)
  const refs = referencedImages(await res.json())
  const inBucket = new Set(files.map(f => f.path))
  const used = new Set(refs.filter(r => r.project === project).map(r => r.path))
  const missing = refs.filter(r => r.project === project && !inBucket.has(r.path))
  const otherProject = refs.filter(r => r.project !== project)

  const byFolder = {}
  const types = {}
  for (const f of files) {
    const folder = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '（一番上）'
    byFolder[folder] ??= { count: 0, bytes: 0 }
    byFolder[folder].count++
    byFolder[folder].bytes += f.size || 0
    const type = f.mimetype || '（不明）'
    types[type] = (types[type] || 0) + 1
  }

  console.log(`接続先: ${db.url}（バンドル ${db.bundle}）`)
  console.log(`写真の置き場 ${BUCKET}: ${files.length}ファイル・${mb(totalBytes)}`)
  for (const [folder, v] of Object.entries(byFolder).sort()) console.log(`  ${folder}: ${v.count}ファイル・${mb(v.bytes)}`)
  console.log(`種類: ${Object.entries(types).map(([t, n]) => `${t}=${n}`).join(', ')}`)
  console.log(`DBが指している写真: ${used.size}枚（置き場にあるのに使っていないもの ${files.filter(f => !used.has(f.path)).length}ファイル）`)
  if (missing.length) {
    console.log(`⚠️  DBが指しているのに置き場に無い写真: ${missing.length}件`)
    missing.forEach(r => console.log(`  - ${r.where}: ${r.path}`))
  }
  if (otherProject.length) {
    console.log(`⚠️  別のプロジェクトの写真を指している所: ${otherProject.length}件`)
    otherProject.forEach(r => console.log(`  - ${r.where}: ${r.project} / ${r.path}`))
  }

  if (LIST_ONLY) return

  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const base = join(BACKUP_DIR, '写真', stamp)
  const root = join(base, BUCKET)
  await mkdir(root, { recursive: true })

  const saved = []
  const problems = []
  let next = 0
  async function worker() {
    while (next < files.length) {
      const f = files[next++]
      const target = safeTarget(root, f.path)
      if (!target) { problems.push(`名前が不正なので飛ばしました: ${JSON.stringify(f.path)}`); continue }
      try {
        const body = await download(db, f.path)
        const md5 = createHash('md5').update(body).digest('hex')
        const etag = f.eTag.replace(/"/g, '')
        if (f.size !== null && body.length !== f.size) problems.push(`${f.path}: 大きさが本番の記録と違います（本番 ${f.size} / 手元 ${body.length}）`)
        if (/^[0-9a-f]{32}$/.test(etag) && etag !== md5) problems.push(`${f.path}: 中身の指紋（MD5）が本番の記録と違います`)
        await mkdir(dirname(target), { recursive: true })
        await writeFile(`${target}.partial`, body)
        await rename(`${target}.partial`, target)
        saved.push({ ...f, md5, md5Checked: /^[0-9a-f]{32}$/.test(etag), used: used.has(f.path) })
      } catch (e) {
        problems.push(`${f.path}: 落とせませんでした（${e.message}）`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  // 書き終わった物を数え直す（途中で止まった .partial が残っていないかも見る）
  const disk = await filesOnDisk(root)
  const diskBytes = disk.reduce((s, f) => s + f.size, 0)
  if (disk.some(f => f.full.endsWith('.partial'))) problems.push('書きかけのファイル（.partial）が残っています')
  if (disk.length !== files.length) problems.push(`ファイル数が合いません（本番 ${files.length} / 手元 ${disk.length}）`)
  if (diskBytes !== totalBytes) problems.push(`合計の大きさが合いません（本番 ${totalBytes} / 手元 ${diskBytes}）`)

  saved.sort((a, b) => a.path.localeCompare(b.path))
  await writeFile(join(base, '_一覧.json'), JSON.stringify({
    takenAt: now.toISOString(),
    database: { url: db.url, bundle: db.bundle },
    bucket: BUCKET,
    count: files.length,
    totalBytes,
    byFolder,
    types,
    referenced: { used: used.size, missing, otherProject },
    problems,
    files: saved,
  }, null, 2), 'utf8')

  console.log(`\n保存先: ${base}`)
  console.log(`手元: ${disk.length}ファイル・${mb(diskBytes)}（MD5 で照合 ${saved.filter(f => f.md5Checked).length}ファイル）`)
  if (problems.length) {
    console.log(`\n⚠️  問題 ${problems.length}件`)
    problems.forEach(p => console.log(`  - ${p}`))
    process.exitCode = 1
  } else {
    console.log('本番の記録と、数・大きさ・中身がすべて一致しました')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(err => {
  console.error('写真のバックアップ失敗:', err.message)
  process.exit(1)
})
