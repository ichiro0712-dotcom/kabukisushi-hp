#!/usr/bin/env node
/**
 * 本番データ（store_settings）の点検。お客さんに見えている所の「直し忘れ」を見つける。
 *
 * 2026-10-15 の点検で、英語ページに「New Menu Item」「새 메뉴」「한국어」などの仮の文字が10品に出ていた。
 * HPとレジの値段違いも4品あった。毎朝のバックアップのついでにこれを回して、早く気づけるようにする。
 *
 * 単体で使うとき:  node scripts/check-settings.mjs [バックアップのJSON]   （省略時は一番新しいバックアップ）
 * backup-settings.mjs からは checkSettings(rows) を呼ぶ。
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'

const BACKUP_DIR = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', 'システム', 'HPバックアップ')
const REGISTER_DIR = join(homedir(), 'Desktop', 'わびすけ', 'cc-company', '財務経理', 'エアレジ商品マスタ')

const STORE_LABEL = { honten: '本店', ichiban: '1番通り店' }
const CATEGORY_LABEL = { nigiri: '握り', makimono: '巻物', ippin: '一品', nihonshu: '日本酒' }
const CATEGORIES = [['menu', 'nigiri'], ['menu', 'makimono'], ['menu', 'ippin'], ['drink', 'nihonshu']]

/** 管理画面の「+追加」の旧初期値と、空欄の見本の文字。公開ページに出ていたら直し忘れ */
const PLACEHOLDERS = new Set(['New Menu Item', '새 메뉴', '新菜单', '新菜', '新しいメニュー', '한국어', '中文', 'Korean', 'Chinese', 'English', 'English Name', 'Optional description...'])

/** 英語ページに出る欄（日本酒は韓国語・中国語を出さない。補足は握りだけ） */
function publicFields(category) {
  if (category === 'nihonshu') return ['name', 'name_en', 'price']
  if (category === 'nigiri') return ['name', 'name_en', 'name_sub', 'name_ko', 'name_zh', 'price']
  return ['name', 'name_en', 'name_ko', 'name_zh', 'price']
}
const FIELD_LABEL = { name: '名前', name_en: '英語名', name_sub: '英語の補足', name_ko: '韓国語', name_zh: '中国語', price: '値段' }

/** エアレジの日本語カテゴリ（値段の突き合わせ用）。財務経理/エアレジ商品マスタ の実測 */
const REGISTER_CATEGORIES = {
  honten: { nigiri: ['0002'], makimono: ['0012'], ippin: ['0003', '0004'], nihonshu: ['0007'] },
  ichiban: { nigiri: ['0004'], makimono: ['0005'], ippin: ['0006', '0003'], nihonshu: ['0010'] },
}
const REGISTER_FILE = { honten: '本店', ichiban: '1番通り店' }

const plain = v => String(v ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const norm = v => plain(v).normalize('NFKC').replace(/[\s　・]/g, '')

function itemIndices(section, category) {
  return [...new Set(Object.keys(section || {})
    .filter(k => k.startsWith(`${category}_`) && k.endsWith('_name'))
    .map(k => Number(k.split('_')[1]))
    .filter(n => Number.isInteger(n)))]
}

/** エアレジ商品マスタ（cp932 の CSV）を読む。無ければ null */
async function readRegister(storeId) {
  const path = join(REGISTER_DIR, `商品マスタ_${REGISTER_FILE[storeId]}_latest.csv`)
  try {
    const buf = await readFile(path)
    const text = new TextDecoder('shift_jis').decode(buf)
    const rows = []
    for (const line of text.split(/\r?\n/).slice(2)) {
      if (!line.trim()) continue
      const cols = []
      let cur = '', quoted = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (quoted) {
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
          else if (ch === '"') quoted = false
          else cur += ch
        } else if (ch === '"') quoted = true
        else if (ch === ',') { cols.push(cur); cur = '' }
        else cur += ch
      }
      cols.push(cur)
      rows.push({ id: cols[0], category: cols[3], name: cols[4], price: cols[14], shown: cols[21] === '表示' })
    }
    const { mtime } = await stat(path)
    return { rows, takenAt: mtime }
  } catch {
    return null
  }
}

/**
 * 点検の本体。
 * problems = お客さんに見えていて直したほうがいい所（通知する）
 * notes    = 知っておけばよい所（写真なしなど。通知しない）
 */
export async function checkSettings(rows) {
  const problems = []
  const notes = []
  const texts = Object.fromEntries(rows.filter(r => r.settings_type === 'text').map(r => [r.store_id, r.data || {}]))

  for (const storeId of Object.keys(STORE_LABEL)) {
    const data = texts[storeId]
    if (!data) { problems.push({ key: `${storeId}:no-text`, text: `${STORE_LABEL[storeId]}：データ（text）がありません` }); continue }
    const register = await readRegister(storeId)

    for (const [sectionId, category] of CATEGORIES) {
      const section = data[sectionId] || {}
      for (const i of itemIndices(section, category)) {
        if (section[`${category}_${i}_hidden`] === 'true') continue
        const get = f => section[`${category}_${i}_${f}`]
        const name = plain(get('name')) || `#${i}`
        const where = `${STORE_LABEL[storeId]}／${CATEGORY_LABEL[category]}「${name}」`

        for (const f of publicFields(category)) {
          const v = get(f)
          if (v === undefined || v === null) continue
          const p = plain(v)
          if (PLACEHOLDERS.has(p)) problems.push({ key: `${storeId}:${category}_${i}_${f}:placeholder`, text: `${where}：${FIELD_LABEL[f]}が仮の文字「${p}」のまま` })
          if (/<[a-z/][^>]*>/i.test(String(v)) && f !== 'price') problems.push({ key: `${storeId}:${category}_${i}_${f}:html`, text: `${where}：${FIELD_LABEL[f]}に余計な書式が入っています` })
        }

        const price = plain(get('price')).replace(/[,，¥￥円]/g, '')
        if (!/^\d+$/.test(price)) problems.push({ key: `${storeId}:${category}_${i}_price:nan`, text: `${where}：値段が数字ではありません（${plain(get('price')) || '空'}）` })
        else if (Number(price) === 0) problems.push({ key: `${storeId}:${category}_${i}_price:zero`, text: `${where}：値段が¥0のまま表示されています` })

        if (!plain(get('name_en'))) notes.push(`${where}：英語名が空（英語ページには日本語名が出ます）`)
        const image = String(get('image') || '')
        if (!image || image.includes('photo-placeholder')) notes.push(`${where}：写真が未設定（ロゴが出ます）`)

        // レジとの値段の突き合わせ（名前が完全に一致し、レジで「表示」の商品だけ）
        if (register && /^\d+$/.test(price)) {
          const cats = REGISTER_CATEGORIES[storeId][category] || []
          const same = register.rows.filter(r => r.shown && cats.includes(r.category) && norm(r.name) === norm(get('name')))
          const prices = [...new Set(same.map(r => r.price))]
          if (prices.length && !prices.includes(price)) {
            const d = register.takenAt
            problems.push({ key: `${storeId}:${category}_${i}:register:${price}:${prices.join('/')}`, text: `${where}：HPは¥${Number(price).toLocaleString()}、レジは¥${prices.map(p => Number(p).toLocaleString()).join('/')}（レジのマスタ ${d.getMonth() + 1}/${d.getDate()}時点）` })
          }
        }
      }
    }
  }
  return { problems, notes }
}

/** 一番新しいバックアップ（ファイル名の日時で並べる） */
export async function latestBackupFile() {
  const files = (await readdir(BACKUP_DIR)).filter(f => /^\d{4}-\d{2}-\d{2}_\d{4}(\d{2})?_本番DB\.json$/.test(f))
  const time = f => { const m = f.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})?/); return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)).getTime() }
  files.sort((a, b) => time(a) - time(b))
  return files.length ? join(BACKUP_DIR, files[files.length - 1]) : null
}

// 単体で実行したとき
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2] || await latestBackupFile()
  if (!path) { console.error('バックアップが見つかりません'); process.exit(1) }
  const body = JSON.parse(await readFile(path, 'utf8'))
  const { problems, notes } = await checkSettings(body.rows)
  console.log(`点検: ${path}`)
  console.log(problems.length ? `\n直したほうがいい所 ${problems.length}件` : '\n直したほうがいい所はありません')
  problems.forEach(p => console.log(`  - ${p.text}`))
  if (notes.length) { console.log(`\n参考 ${notes.length}件`); notes.forEach(n => console.log(`  - ${n}`)) }
}
