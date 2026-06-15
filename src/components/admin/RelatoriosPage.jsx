import { useEffect, useMemo, useState } from 'react'
import { getOrders } from '../../lib/orders'
import { getEstoque } from '../../lib/estoque'
import { getDespesas, getInvestimentos } from '../../lib/finance'

export default function RelatoriosPage() {
  const [orders, setOrders] = useState([])
  const [estoque, setEstoque] = useState([])
  const [despesas, setDespesas] = useState([])
  const [investimentos, setInvestimentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [ordersData, estoqueData, despesasData, investimentosData] = await Promise.allSettled([
      getOrders(),
      getEstoque(),
      getDespesas(),
      getInvestimentos(),
    ])
    setOrders(ordersData.status === 'fulfilled' ? ordersData.value : [])
    setEstoque(estoqueData.status === 'fulfilled' ? estoqueData.value : [])
    setDespesas(despesasData.status === 'fulfilled' ? despesasData.value : [])
    setInvestimentos(investimentosData.status === 'fulfilled' ? investimentosData.value : [])
    setLoading(false)
  }

  const receita = useMemo(() => {
    return orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0)
  }, [orders])

  const despesasTotal = useMemo(() => {
    return despesas.reduce((s, item) => s + Number(item.amount || 0), 0)
  }, [despesas])

  const capitalInvestido = useMemo(() => {
    return investimentos.reduce((s, item) => s + Number(item.amount || 0), 0)
  }, [investimentos])

  const lucro = receita - despesasTotal
  const roi = capitalInvestido > 0 ? (lucro / capitalInvestido) * 100 : 0
  const estoqueValor = estoque.reduce((s, it) => s + Number(it.available_qty || 0) * Number(it.unit_cost || 0), 0)

  const produtosMaisVendidos = useMemo(() => {
    const map = new Map()
    orders.forEach(o => {
      const items = Array.isArray(o.products) ? o.products : []
      items.forEach(i => {
        map.set(i.title, (map.get(i.title) || 0) + Number(i.qty || 0))
      })
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([title, qty]) => ({ title, qty }))
  }, [orders])

  const vendasEvolucao = useMemo(() => {
    const byDay = {}
    orders.forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString('pt-BR')
      byDay[d] = (byDay[d] || 0) + Number(o.total || 0)
    })
    return Object.entries(byDay).map(([date, total]) => ({ date, total }))
  }, [orders])

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Relatórios</h1>
        <p className="text-sm text-dm-muted mt-1">Receita, lucro, ROI, vendas e estoque</p>
      </div>

      {loading ? (
        <div className="dm-admin-card py-10 text-center text-dm-muted">Carregando...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Card label="Receita" value={`R$ ${receita.toFixed(2)}`} color="text-green-400" />
            <Card label="Lucro" value={`R$ ${lucro.toFixed(2)}`} color={lucro >= 0 ? 'text-emerald-400' : 'text-red-400'} />
            <Card label="ROI" value={`${roi.toFixed(2)}%`} color="text-purple-400" />
            <Card label="Valor do Estoque" value={`R$ ${estoqueValor.toFixed(2)}`} color="text-dm-gold" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GraficoBarras title="Evolução das vendas" items={vendasEvolucao.map(v => ({ label: v.date, value: v.total }))} prefix="R$ " />
            <GraficoBarras title="Produtos mais vendidos" items={produtosMaisVendidos.map(v => ({ label: v.title, value: v.qty }))} />
            <Resumo title="Receita e lucro" rows={[
              ['Receita', `R$ ${receita.toFixed(2)}`],
              ['Despesas', `R$ ${despesasTotal.toFixed(2)}`],
              ['Lucro', `R$ ${lucro.toFixed(2)}`],
            ]} />
            <Resumo title="ROI e estoque" rows={[
              ['Capital investido', `R$ ${capitalInvestido.toFixed(2)}`],
              ['ROI', `${roi.toFixed(2)}%`],
              ['Valor do estoque', `R$ ${estoqueValor.toFixed(2)}`],
            ]} />
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ label, value, color }) {
  return (
    <div className="dm-stat">
      <p className="dm-stat-label">{label}</p>
      <p className={`dm-stat-value ${color}`}>{value}</p>
    </div>
  )
}

function GraficoBarras({ title, items, prefix = '' }) {
  const max = Math.max(...items.map(item => Number(item.value || 0)), 1)

  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-dm-muted text-sm">Sem dados para exibir.</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-[11px] text-dm-muted mb-1">
                <span>{item.label}</span>
                <span>{prefix}{Number(item.value).toFixed(prefix ? 2 : 0)}</span>
              </div>
              <div className="h-2 bg-dm-border">
                <div className="h-2 bg-dm-gold" style={{ width: `${Math.max(4, (Number(item.value) / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Resumo({ title, rows }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm text-dm-muted border-b border-dm-border pb-2 last:border-0">
            <span>{label}</span>
            <span className="text-dm-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
