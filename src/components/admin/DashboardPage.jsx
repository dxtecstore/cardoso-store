import { useEffect, useState } from 'react'
import { getAllProducts } from '../../lib/products'
import { getOrders } from '../../lib/orders'
import { getEstoque } from '../../lib/estoque'
import { getDespesas, getInvestimentos } from '../../lib/finance'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  DollarSign,
  Layers,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react'

const STATUS_LABEL = {
  pending: 'Pendente',
  paid: 'Pago',
  separating: 'Separando',
  shipping: 'A caminho',
  shipped: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default function DashboardPage() {
  const [prods, setProds] = useState([])
  const [orders, setOrders] = useState([])
  const [estoque, setEstoque] = useState([])
  const [despesas, setDespesas] = useState([])
  const [investimentos, setInvestimentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getAllProducts(),
      getOrders(),
      getEstoque(),
      getDespesas(),
      getInvestimentos(),
    ])
      .then(([p, o, e, d, i]) => {
        setProds(p.status === 'fulfilled' ? p.value : [])
        setOrders(o.status === 'fulfilled' ? o.value : [])
        setEstoque(e.status === 'fulfilled' ? e.value : [])
        setDespesas(d.status === 'fulfilled' ? d.value : [])
        setInvestimentos(i.status === 'fulfilled' ? i.value : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const pending = orders.filter(o => o.status === 'pending').length
  const despesasTotais = despesas.reduce((s, d) => s + Number(d.amount || 0), 0)
  const capitalInvestido = investimentos.reduce((s, i) => s + Number(i.amount || 0), 0)
  const valorEstoque = estoque.reduce((s, i) => s + Number(i.unit_cost || 0) * Number(i.available_qty || 0), 0)
  const lucroLiquido = revenue - despesasTotais
  const roi = capitalInvestido > 0 ? (lucroLiquido / capitalInvestido) * 100 : 0
  const produtosBaixo = estoque.filter(item => Number(item.available_qty || 0) <= Number(item.alert_threshold || 5)).length

  const produtoMaisVendido = (() => {
    const counts = {}
    orders.forEach(order => {
      const items = Array.isArray(order.products) ? order.products : []
      items.forEach(item => {
        counts[item.title] = (counts[item.title] || 0) + Number(item.qty || 0)
      })
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  })()

  const stats = [
    { label: 'Produtos', value: loading ? '—' : prods.length, color: 'text-blue-400', icon: Package },
    { label: 'Pedidos', value: loading ? '—' : orders.length, color: 'text-dm-gold', icon: ShoppingBag },
    { label: 'Receita Total', value: loading ? '—' : `R$ ${revenue.toFixed(2)}`, color: 'text-green-400', icon: TrendingUp },
    { label: 'Pendentes', value: loading ? '—' : pending, color: 'text-yellow-400', icon: Clock },
    { label: 'Capital Investido', value: loading ? '—' : `R$ ${capitalInvestido.toFixed(2)}`, color: 'text-dm-gold', icon: DollarSign },
    { label: 'Lucro Líquido', value: loading ? '—' : `R$ ${lucroLiquido.toFixed(2)}`, color: 'text-emerald-400', icon: ArrowUpRight },
    { label: 'ROI', value: loading ? '—' : `${roi.toFixed(2)}%`, color: 'text-purple-400', icon: Layers },
    { label: 'Valor Total em Estoque', value: loading ? '—' : `R$ ${valorEstoque.toFixed(2)}`, color: 'text-dm-gold', icon: Layers },
    { label: 'Produtos com Estoque Baixo', value: loading ? '—' : produtosBaixo, color: 'text-red-400', icon: AlertCircle },
    { label: 'Produto Mais Vendido', value: loading ? '—' : produtoMaisVendido, color: 'text-orange-400', icon: TrendingUp },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Painel Inicial</h1>
        <p className="text-sm text-dm-muted mt-1">Visão geral da loja</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="dm-stat">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="dm-stat-label">{s.label}</p>
                <p className={`dm-stat-value ${s.color}`}>{s.value}</p>
              </div>
              <s.icon size={18} className={`${s.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      <div className="dm-admin-card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-dm-border">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-dm-muted">Pedidos Recentes</h2>
        </div>
        {loading ? (
          <p className="px-5 py-6 text-dm-muted text-sm">Carregando...</p>
        ) : orders.length === 0 ? (
          <p className="px-5 py-6 text-dm-muted text-sm">Nenhum pedido ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(o => (
                  <tr key={o.id}>
                    <td>
                      <p className="font-medium text-[13px]">{o.customer_name}</p>
                      <p className="text-[10px] text-dm-muted">{o.customer_phone}</p>
                    </td>
                    <td className="text-dm-gold">R$ {Number(o.total).toFixed(2)}</td>
                    <td>
                      <span className={`dm-status ${o.status}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="text-dm-muted text-[10px]">
                      {new Date(o.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
