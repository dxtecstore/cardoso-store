import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Cardoso Store] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas.\n' +
    'Copie .env.example para .env e preencha com seus dados do Supabase.'
  )
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder'
)
