import { supabase } from './supabase'

const DEFAULT_BUCKET = 'dantas-images'
const LEGACY_BUCKET = 'cardoso-images'
const BUCKETS = [import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET, LEGACY_BUCKET]

/**
 * Upload de imagem para o Supabase Storage.
 * Funciona em desktop e mobile (aceita File de <input type="file">).
 * Retorna a URL pública do arquivo.
 */
export async function uploadImage(file, folder = 'products') {
  if (!file) throw new Error('Nenhum arquivo selecionado')

  // Valida tipo
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG ou WebP.')
  }

  // Limite 5 MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Imagem muito grande. Máximo 5 MB.')
  }

  const ext  = file.name.split('.').pop().toLowerCase()
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  let lastError = null
  for (const bucket of BUCKETS) {
    const { error } = await supabase.storage.from(bucket).upload(name, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(name)
      return data.publicUrl
    }

    lastError = error
  }

  throw new Error(`Upload falhou: ${lastError?.message || 'Erro desconhecido'}`)
}

/**
 * Remove imagem pelo path relativo (ex: "products/abc.jpg")
 */
export async function deleteImage(publicUrl) {
  if (!publicUrl) return

  try {
    for (const bucket of BUCKETS) {
      const parts = publicUrl.split(`/${bucket}/`)
      if (parts.length < 2) continue
      await supabase.storage.from(bucket).remove([parts[1]])
      return
    }
  } catch (_) { /* silencioso */ }
}
