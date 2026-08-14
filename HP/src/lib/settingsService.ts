import { supabase } from './supabase'

type SettingsType = 'background' | 'layout' | 'text'

const SETTINGS_TYPES: SettingsType[] = ['background', 'layout', 'text']

/** 行ごとの updated_at。楽観ロック（他端末の更新を踏み潰さないため）のトークンとして使う */
export type SettingsVersions = Partial<Record<SettingsType, string>>

export type LoadResult = {
  /**
   * false = 読み込みに失敗した（DB停止・ネットワーク断など）。
   * この場合は絶対に保存してはいけない。古い状態でDBを丸ごと上書きしてしまうため。
   */
  ok: boolean
  reason?: 'no-client' | 'error'
  errorMessage?: string
  backgroundSettings: Record<string, any> | null
  layoutSettings: Record<string, any> | null
  textSettings: Record<string, Record<string, string>> | null
  versions: SettingsVersions
}

export type SaveResult = {
  /**
   * ok       = 保存成功
   * conflict = 読み込み後に他端末がDBを更新していた。上書きせず中断した
   * error    = 通信・権限エラー
   */
  status: 'ok' | 'conflict' | 'error'
  versions: SettingsVersions
  message?: string
}

export async function loadStoreSettings(storeId: string): Promise<LoadResult> {
  const empty: LoadResult = {
    ok: false,
    backgroundSettings: null,
    layoutSettings: null,
    textSettings: null,
    versions: {},
  }

  if (!supabase) return { ...empty, reason: 'no-client', errorMessage: 'Supabase 接続情報が設定されていません' }

  const { data, error } = await supabase
    .from('store_settings')
    .select('settings_type, data, updated_at')
    .eq('store_id', storeId)

  if (error) {
    console.error('Failed to load settings from Supabase:', error)
    return { ...empty, reason: 'error', errorMessage: error.message }
  }

  const result: LoadResult = { ...empty, ok: true }

  data?.forEach((row: { settings_type: string; data: any; updated_at: string }) => {
    if (row.settings_type === 'background') result.backgroundSettings = row.data
    if (row.settings_type === 'layout') result.layoutSettings = row.data
    if (row.settings_type === 'text') result.textSettings = row.data
    if (SETTINGS_TYPES.includes(row.settings_type as SettingsType)) {
      result.versions[row.settings_type as SettingsType] = row.updated_at
    }
  })

  return result
}

/**
 * 設定を保存する。
 *
 * expectedVersions には loadStoreSettings で取得した versions をそのまま渡すこと。
 * 保存直前にDB側の updated_at と突き合わせ、読み込み後に他端末が更新していた場合は
 * 上書きせず conflict を返す（= 2026-08-14 に起きた「古い状態での全体上書き」を防ぐ）。
 */
export async function saveAllSettings(
  storeId: string,
  backgroundSettings: Record<string, any>,
  layoutSettings: Record<string, any>,
  textSettings: Record<string, Record<string, string>>,
  expectedVersions: SettingsVersions
): Promise<SaveResult> {
  if (!supabase) return { status: 'error', versions: {}, message: 'Supabase 接続情報が設定されていません' }

  const now = new Date().toISOString()
  const payloads: Record<SettingsType, Record<string, any>> = {
    background: backgroundSettings,
    layout: layoutSettings,
    text: textSettings,
  }

  const versions: SettingsVersions = { ...expectedVersions }

  for (const type of SETTINGS_TYPES) {
    const expected = expectedVersions[type]

    if (expected) {
      // 既存行の更新。updated_at が読み込んだ時のままの場合だけ書き換わる
      const { data, error } = await supabase
        .from('store_settings')
        .update({ data: payloads[type], updated_at: now })
        .eq('store_id', storeId)
        .eq('settings_type', type)
        .eq('updated_at', expected)
        .select('updated_at')

      if (error) {
        console.error(`Failed to save ${type} settings:`, error)
        return { status: 'error', versions, message: error.message }
      }

      if (!data || data.length === 0) {
        // 誰かが先に更新した（か、行が消えた）。踏み潰さずに中断する
        console.warn(`Save aborted: ${storeId}/${type} was modified by someone else`)
        return {
          status: 'conflict',
          versions,
          message: `${type} の設定が他の端末で更新されています`,
        }
      }

      versions[type] = data[0].updated_at
    } else {
      // 行がまだ無い場合のみ新規作成
      const { data, error } = await supabase
        .from('store_settings')
        .insert({ store_id: storeId, settings_type: type, data: payloads[type], updated_at: now })
        .select('updated_at')

      if (error) {
        // 重複キー = 読み込み時に無かった行が増えている → 上書きせず中断
        if (error.code === '23505') {
          console.warn(`Save aborted: ${storeId}/${type} was created by someone else`)
          return { status: 'conflict', versions, message: `${type} の設定が他の端末で作成されています` }
        }
        console.error(`Failed to insert ${type} settings:`, error)
        return { status: 'error', versions, message: error.message }
      }

      if (data && data.length > 0) versions[type] = data[0].updated_at
    }
  }

  return { status: 'ok', versions }
}
