import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/**
 * 本番サイト(kabuki-sushi.co.jp)が読み書きしている Supabase プロジェクト。
 *
 * 過去に「ローカルの .env.local だけ別プロジェクトを指していて、管理画面で編集した
 * つもりが本番に反映されない／どちらが正しいDBか分からなくなる」という事故が起きた。
 * 接続先を画面に出して取り違えを防ぐため、正となるプロジェクトをここに明示しておく。
 */
export const PRODUCTION_PROJECT_REF = 'saklodzpbduhfzbkukog'

/** 接続中の Supabase プロジェクト参照（例: saklodzpbduhfzbkukog）。未設定なら null */
export const connectedProjectRef =
  supabaseUrl?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? null

/** 本番DBに繋がっているか。false の場合、ここでの編集は本番サイトに反映されない */
export const isProductionDb = connectedProjectRef === PRODUCTION_PROJECT_REF
