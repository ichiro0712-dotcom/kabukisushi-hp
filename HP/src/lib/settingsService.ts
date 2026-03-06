import { supabase } from './supabase'

type SettingsType = 'background' | 'layout' | 'text'

export async function loadStoreSettings(storeId: string): Promise<{
  backgroundSettings: Record<string, any> | null
  layoutSettings: Record<string, any> | null
  textSettings: Record<string, Record<string, string>> | null
}> {
  if (!supabase) return { backgroundSettings: null, layoutSettings: null, textSettings: null }

  const { data, error } = await supabase
    .from('store_settings')
    .select('settings_type, data')
    .eq('store_id', storeId)

  if (error) {
    console.error('Failed to load settings from Supabase:', error)
    return { backgroundSettings: null, layoutSettings: null, textSettings: null }
  }

  const result: {
    backgroundSettings: Record<string, any> | null
    layoutSettings: Record<string, any> | null
    textSettings: Record<string, Record<string, string>> | null
  } = { backgroundSettings: null, layoutSettings: null, textSettings: null }

  data?.forEach((row: { settings_type: string; data: any }) => {
    if (row.settings_type === 'background') result.backgroundSettings = row.data
    if (row.settings_type === 'layout') result.layoutSettings = row.data
    if (row.settings_type === 'text') result.textSettings = row.data
  })

  return result
}

export async function saveAllSettings(
  storeId: string,
  backgroundSettings: Record<string, any>,
  layoutSettings: Record<string, any>,
  textSettings: Record<string, Record<string, string>>
): Promise<boolean> {
  if (!supabase) return false

  const now = new Date().toISOString()
  const rows = [
    { store_id: storeId, settings_type: 'background' as SettingsType, data: backgroundSettings, updated_at: now },
    { store_id: storeId, settings_type: 'layout' as SettingsType, data: layoutSettings, updated_at: now },
    { store_id: storeId, settings_type: 'text' as SettingsType, data: textSettings, updated_at: now },
  ]

  const { error } = await supabase
    .from('store_settings')
    .upsert(rows, { onConflict: 'store_id,settings_type' })

  if (error) {
    console.error('Failed to save settings to Supabase:', error)
    return false
  }
  return true
}
