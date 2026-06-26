import { supabase } from './supabase'
import { STORE_WHATSAPP } from './whatsapp'

/**
 * Retorna todas as configurações como objeto { key: value }
 */
export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
}

/**
 * Salva/atualiza uma configuração pelo key
 */
export async function setSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

/**
 * Salva múltiplas configurações de uma vez
 */
export async function setSettings(pairs) {
  const rows = Object.entries(pairs).map(([key, value]) => ({ key, value }))
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

// Defaults usados quando o Supabase ainda não tem as configs
export const SETTINGS_DEFAULTS = {
  store_name:  'Cardoso Store',
  logo_url:    '',
  whatsapp:    STORE_WHATSAPP,
  instagram:   'cardoso.store',
  hero_title:  'Vista Presença.',
  hero_sub:    'Moda premium multimarcas. Elegância em cada detalhe.',
  hero_cta:    'Ver Catálogo',
  banner_url:  '',
  address:     '',
  accent_color: '#c9a84c',
}
