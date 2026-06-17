import { useState } from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { createOrder } from '../../lib/orders'
import toast from 'react-hot-toast'

const STEPS = { CART: 'cart', CHECKOUT: 'checkout', SUCCESS: 'success' }
const STORE_WHATSAPP = '5591983181896'

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, removeItem, updateQty, clearCart } = useCart()
  const { settings } = useSettings()
  const [step, setStep] = useState(STEPS.CART)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => setStep(STEPS.CART), 400)
  }

  function buildOwnerMessage() {
    const storeName = settings.store_name || 'Cardoso Store'
    const formatCurrency = value =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(value) || 0)

    const lineItems = items
      .map(i => {
        const size = i.size ? ` (${i.size})` : ''
        const itemTotal = Number(i.product.price) * i.qty
        return `• ${i.product.title}${size} × ${i.qty} — ${formatCurrency(itemTotal)}`
      })
      .join('\n')

    return [
      '🛒 *PEDIDO CONFIRMADO!*',
      '',
      `Obrigado por comprar na *${storeName}*. Seu pedido já foi registrado em nosso sistema.`,
      '',
      '📦 *Resumo do Pedido*',
      '',
      `👤 *Cliente:* ${form.name.trim()}`,
      `📞 *Telefone:* ${form.phone.trim()}`,
      '',
      '📍 *Entrega:*',
      form.address.trim(),
      '',
      '━━━━━━━━━━━━━━━',
      '',
      '📦 *Itens do Pedido:*',
      lineItems,
      '',
      '━━━━━━━━━━━━━━━',
      '',
      `💳 *Total:* ${formatCurrency(total)}`,
      '',
      '✅ *Para concluir sua compra:*',
      'Envie o comprovante de pagamento nesta conversa.',
      '',
      'Após a confirmação, seu pedido será separado e liberado para entrega.',
      '',
      '🙏 Agradecemos pela preferência!',
      `*${storeName}*`,
    ].join('\n')
  }

  async function handleOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    setSaving(true)
    try {
      const orderData = {
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        products: items.map(i => ({
          id: i.product.id,
          title: i.product.title,
          price: i.product.price,
          size: i.size,
          qty: i.qty,
        })),
        total,
        status: 'pending',
      }

      await createOrder(orderData)

      const message = buildOwnerMessage()
      window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')

      clearCart()
      setStep(STEPS.SUCCESS)
      toast.success('Pedido registrado com sucesso!')
    } catch (err) {
      toast.error('Erro ao registrar pedido. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const stepTitle = {
    cart: 'Carrinho',
    checkout: 'Finalizar Pedido',
    success: 'Pedido Enviado!',
  }

  return (
    <>
      <div className={`dm-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose} />

      <aside className={`dm-drawer ${isOpen ? 'open' : ''}`} aria-label="Carrinho">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dm-border">
          <h2 className="text-[10px] tracking-[0.25em] uppercase font-semibold">
            {stepTitle[step]}
          </h2>
          <button onClick={handleClose} className="text-dm-muted hover:text-dm-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === STEPS.CART && (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-dm-muted gap-3">
                <ShoppingBag size={32} strokeWidth={1} />
                <p className="text-sm">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3 py-4 border-b border-dm-border/40">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.title}
                        className="w-14 h-[72px] object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-[72px] bg-dm-card flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-snug">{item.product.title}</p>
                      <p className="text-[10px] text-dm-muted mt-0.5">Tamanho: {item.size}</p>
                      <p className="text-dm-gold text-[13px] mt-1">
                        R$ {(Number(item.product.price) * item.qty).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="w-6 h-6 border border-dm-border flex items-center justify-center hover:border-dm-gold text-dm-muted hover:text-dm-gold transition-colors"
                        ><Minus size={9} /></button>
                        <span className="text-xs w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="w-6 h-6 border border-dm-border flex items-center justify-center hover:border-dm-gold text-dm-muted hover:text-dm-gold transition-colors"
                        ><Plus size={9} /></button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="text-dm-muted hover:text-red-400 self-start pt-1 transition-colors"
                    ><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )
          )}

          {step === STEPS.CHECKOUT && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="dm-label">Nome completo *</label>
                <input name="name" value={form.name} onChange={handleChange} className="dm-input" placeholder="Seu nome" />
              </div>
              <div>
                <label className="dm-label">WhatsApp *</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="dm-input" placeholder="(91) 99999-9999" inputMode="tel" />
              </div>
              <div>
                <label className="dm-label">Endereço de entrega *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="dm-input resize-none"
                  placeholder="Rua, número, bairro, cidade, CEP..."
                />
              </div>

              <div className="border-t border-dm-border pt-4 space-y-1">
                {items.map(i => (
                  <div key={i.key} className="flex justify-between text-[10px] text-dm-muted py-0.5">
                    <span>{i.product.title} ({i.size}) x{i.qty}</span>
                    <span>R$ {(Number(i.product.price) * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center justify-center h-52 text-center gap-4">
              <div className="w-14 h-14 rounded-full border border-dm-gold bg-dm-gold/10 flex items-center justify-center">
                <span className="text-dm-gold text-2xl">✓</span>
              </div>
              <p className="text-sm font-medium">Pedido enviado com sucesso!</p>
              <p className="text-[11px] text-dm-muted leading-relaxed max-w-[220px]">
                O pedido foi registrado no painel e o WhatsApp da loja foi aberto.
              </p>
              <button onClick={handleClose} className="dm-btn-outline text-[9px] px-5 py-2 mt-2">
                Fechar
              </button>
            </div>
          )}
        </div>

        {step !== STEPS.SUCCESS && (
          <div className="px-5 py-4 border-t border-dm-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] tracking-widest uppercase text-dm-muted">Total</span>
              <span className="text-dm-gold font-semibold text-xl">
                R$ {total.toFixed(2)}
              </span>
            </div>

            {step === STEPS.CART && items.length > 0 && (
              <button onClick={() => setStep(STEPS.CHECKOUT)} className="dm-btn w-full">
                Finalizar Pedido
              </button>
            )}

            {step === STEPS.CHECKOUT && (
              <div className="flex gap-2">
                <button onClick={() => setStep(STEPS.CART)} className="dm-btn-ghost flex-1 text-[9px]">
                  Voltar
                </button>
                <button onClick={handleOrder} disabled={saving} className="dm-btn flex-1 text-[9px]">
                  {saving ? 'Enviando...' : 'Confirmar Pedido'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
