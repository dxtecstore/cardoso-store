import { supabase } from './supabase'

function isMissingTable(error) {
  return ['42P01', 'PGRST116', 'PGRST205'].includes(error?.code)
}

export async function getEstoque() {
  const { data, error } = await supabase
    .from('estoque')
    .select('*')
    .order('updated_at', { ascending: false })

  if (isMissingTable(error)) return []
  if (error) throw error
  return data ?? []
}

export async function getMovimentacoesEstoque() {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select('*')
    .order('created_at', { ascending: false })

  if (isMissingTable(error)) return []
  if (error) throw error
  return data ?? []
}

export async function getEstoqueByProduct(product_id) {
  const { data, error } = await supabase
    .from('estoque')
    .select('*')
    .eq('product_id', product_id)
    .single()
  if (isMissingTable(error)) return null
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function createEstoqueItem(item) {
  const { data, error } = await supabase
    .from('estoque')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEstoqueItem(id, changes) {
  const { data, error } = await supabase
    .from('estoque')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createMovimentacaoEstoque(movimentacao) {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .insert([movimentacao])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveMovimentacaoEstoque({ product_id, type, qty, cost, notes, created_at }) {
  const estoqueItem = await getEstoqueByProduct(product_id)
  const currentQty = Number(estoqueItem?.available_qty ?? 0)
  const delta = type === 'saida' ? -Math.abs(Number(qty)) : Number(qty)
  const nextQty = Math.max(0, currentQty + delta)
  const unit_cost = type === 'entrada'
    ? Number(cost)
    : Number(estoqueItem?.unit_cost ?? cost)

  if (estoqueItem) {
    await updateEstoqueItem(estoqueItem.id, {
      available_qty: nextQty,
      unit_cost,
    })
  } else {
    await createEstoqueItem({
      product_id,
      available_qty: nextQty,
      unit_cost,
      alert_threshold: 5,
      updated_at: new Date().toISOString(),
    })
  }

  return await createMovimentacaoEstoque({
    product_id,
    type,
    qty: Number(qty),
    cost: Number(cost),
    notes,
    created_at,
  })
}
