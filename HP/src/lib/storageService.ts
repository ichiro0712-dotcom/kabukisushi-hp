import { supabase } from './supabase'

export async function uploadImage(
  file: File,
  storeId: string,
  category: string
): Promise<string | null> {
  if (!supabase) return null

  const ext = file.name.split('.').pop() || 'webp'
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
  const path = `${storeId}/${category}/${fileName}`

  const { error } = await supabase.storage
    .from('store-images')
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) {
    console.error('Image upload failed:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('store-images')
    .getPublicUrl(path)

  return urlData.publicUrl
}
