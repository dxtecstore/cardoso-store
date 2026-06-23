import { supabase } from './supabase'

const EXTRA_PREFIX = 'product_extra_'

function splitProductPayload(product) {
  const {
    price_wholesale,
    sizes,
    image_urls,
    ...base
  } = product

  const extras = {
    price_wholesale: price_wholesale ?? null,
    sizes: Array.isArray(sizes) ? sizes : [],
    image_urls: Array.isArray(image_urls) ? image_urls.filter(Boolean).slice(0, 3) : [],
  }

  return { base, extras }
}

async function getProductExtras() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .like('key', `${EXTRA_PREFIX}%`)

  if (error) return {}

  return Object.fromEntries((data ?? []).map(row => {
    try {
      const id = row.key.replace(EXTRA_PREFIX, '')
      return [id, JSON.parse(row.value || '{}')]
    } catch (_) {
      return [row.key.replace(EXTRA_PREFIX, ''), {}]
    }
  }))
}

function mergeProductExtras(products, extrasById) {
  return (products ?? []).map(product => ({
    ...product,
    ...(extrasById[product.id] ?? {}),
  }))
}

async function saveProductExtras(productId, extras) {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key: `${EXTRA_PREFIX}${productId}`,
      value: JSON.stringify(extras),
    }, { onConflict: 'key' })

  if (error) throw error
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  const extras = await getProductExtras()
  return mergeProductExtras(data, extras)
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  const extras = await getProductExtras()
  return mergeProductExtras(data, extras)
}

export async function createProduct(product) {
  const { base, extras } = splitProductPayload(product)
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...base, active: true }])
    .select()
    .single()
  if (error) throw error

  await saveProductExtras(data.id, extras)
  return { ...data, ...extras }
}

export async function updateProduct(id, updates) {
  const { base, extras } = splitProductPayload(updates)
  const { data, error } = await supabase
    .from('products')
    .update({ ...base, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await saveProductExtras(id, extras)
  return { ...data, ...extras }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  await supabase.from('settings').delete().eq('key', `${EXTRA_PREFIX}${id}`)
}
