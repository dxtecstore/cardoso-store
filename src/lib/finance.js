import { supabase } from './supabase'

function isMissingTable(error) {
  return ['42P01', 'PGRST116', 'PGRST205'].includes(error?.code)
}

export async function getInvestimentos() {
  const { data, error } = await supabase
    .from('investimentos')
    .select('*')
    .order('created_at', { ascending: false })

  if (isMissingTable(error)) return []
  if (error) throw error
  return data ?? []
}

export async function getDespesas() {
  const { data, error } = await supabase
    .from('despesas')
    .select('*')
    .order('date', { ascending: false })

  if (isMissingTable(error)) return []
  if (error) throw error
  return data ?? []
}

export async function createInvestimento(investimento) {
  const { data, error } = await supabase
    .from('investimentos')
    .insert([investimento])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createDespesa(despesa) {
  const { data, error } = await supabase
    .from('despesas')
    .insert([despesa])
    .select()
    .single()

  if (error) throw error
  return data
}
