import { useEffect, useState } from 'react'
import { getAllProducts } from '../../lib/products'
import { getOrders }     from '../../lib/orders'
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react'

const STATUS_LABEL = {
  pending: 'Pendente', confirmed: 'Confirmado',
  shipped: 'Enviado',  delivered: 'Entregue', cancelled: 'Cancelado'
}

export default function DashboardPage() {
  const [prods,   setProds]   = useState([])
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllProducts(), getOrders()])
      .then(([p, o]) => { setProds(p); setOrders(o) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const pending = orders.filter(o => o.status === 'pending').length

  const stats = [
    { label: 'Produtos',  value: loading ? '—' : prods.length,              color: 'text-blue-400',  icon: Package     },
    { label: 'Pedidos',   value: loading ? '—' : orders.length,             color: 'text-dm-gold',   icon: ShoppingBag },
    { label: 'Receita',   value: loading ? '—' : `R$ ${revenue.toFixed(2)}`,color: 'text-green-400', icon: TrendingUp  },
    { label: 'Pendentes', value: loading ? '—' : pending,                   color: 'text-yellow-400',icon: Clock       },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-sm text-dm-muted mt-1">Visão geral da loja</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="dm-stat">
            <div className="flex items-start justify-between">
              <div>
                <p className="dm-stat-label">{s.label}</p>
                <p className={`dm-stat-value ${s.color}`}>{s.value}</p>
              </div>
              <s.icon size={18} className={`${s.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
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
