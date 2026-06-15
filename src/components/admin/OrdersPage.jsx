import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, MessageCircle } from 'lucide-react'
import { getOrders, updateOrderStatus, deleteOrder } from '../../lib/orders'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'

const STATUSES = [
  { key: 'pending', label: 'Pendente' },
  { key: 'paid', label: 'Pago' },
  { key: 'separating', label: 'Separando' },
  { key: 'shipping', label: 'A caminho' },
  { key: 'delivered', label: 'Entregue' },
  { key: 'cancelled', label: 'Cancelado' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)
  const { settings } = useSettings()

  async function load() {
    setLoading(true)
    try {
      setOrders(await getOrders())
    } catch (e) {
      toast.error('Erro ao carregar pedidos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id, status) {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Status atualizado')
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este pedido?')) return
    try {
      await deleteOrder(id)
      await load()
      toast.success('Pedido excluído')
    } catch (e) {
      toast.error(e.message)
    }
  }

  function whatsappLink(order) {
    const phone = (order.customer_phone || settings.whatsapp || '').replace(/\D/g, '')
    const status = STATUSES.find(s => s.key === order.status)?.label || order.status
    const msg = `Olá ${order.customer_name}! Seu pedido na ${settings.store_name || 'nossa loja'} está ${status}. Obrigado!`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Pedidos</h1>
        <p className="text-sm text-dm-muted mt-1">{orders.length} pedidos recebidos</p>
      </div>

      {loading ? (
        <p className="text-dm-muted text-sm">Carregando...</p>
      ) : orders.length === 0 ? (
        <div className="dm-admin-card text-center py-12 text-dm-muted text-sm">Nenhum pedido ainda.</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="dm-admin-card">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setOpen(open === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-[13px]">{order.customer_name}</p>
                    <p className="text-[10px] text-dm-muted">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-dm-gold text-[13px] hidden sm:block">
                    R$ {Number(order.total).toFixed(2)}
                  </span>
                  <span className="text-[9px] text-dm-muted hidden md:block">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={`dm-status ${order.status}`}>
                    {STATUSES.find(s => s.key === order.status)?.label || order.status}
                  </span>
                  {open === order.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {open === order.id && (
                <div className="mt-4 pt-4 border-t border-dm-border/50 space-y-4">
                  <div>
                    <p className="dm-label">Itens do pedido</p>
                    <div className="space-y-1">
                      {(Array.isArray(order.products) ? order.products : []).map((item, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-dm-muted py-1 border-b border-dm-border/30 last:border-0">
                          <span>{item.title} ({item.size}) x{item.qty}</span>
                          <span>R$ {(Number(item.price) * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[13px] pt-2">
                      <span className="text-dm-muted">Total</span>
                      <span className="text-dm-gold font-semibold">R$ {Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="dm-label">Endereço de entrega</p>
                    <p className="text-[12px] text-dm-white/65">{order.customer_address}</p>
                  </div>

                  <div>
                    <p className="dm-label">Controle do pedido</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(s => (
                        <button
                          key={s.key}
                          onClick={() => handleStatus(order.id, s.key)}
                          className={`text-[9px] px-3 py-1 border transition-all ${
                            order.status === s.key
                              ? 'border-dm-gold text-dm-gold bg-dm-gold/10'
                              : 'border-dm-border text-dm-muted hover:border-dm-gold/40'
                          }`}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <a
                      href={whatsappLink(order)}
                      target="_blank" rel="noopener noreferrer"
                      className="dm-btn-ghost text-[9px] gap-1.5"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="dm-btn-ghost text-[9px] gap-1.5 hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
