import { useState } from 'react'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart }     from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'

const SIZES = ['P', 'M', 'G', 'GG', 'XGG']

export default function ProductCard({ product }) {
  const { addItem }   = useCart()
  const { settings }  = useSettings()
  const [size, setSize] = useState('')
  const [adding, setAdding] = useState(false)

  const isNew   = Date.now() - new Date(product.created_at).getTime() < 14 * 86400_000
  const hasOff  = product.price_original && product.price_original > product.price
  const offPct  = hasOff ? Math.round((1 - product.price / product.price_original) * 100) : 0

  async function handleAdd() {
    if (!size) { toast.error('Selecione um tamanho'); return }
    setAdding(true)
    addItem(product, size)
    toast.success(`${product.title} adicionado!`)
    setTimeout(() => setAdding(false), 600)
  }

  const phone   = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '5585999999999'
  const waText  = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.title}* — R$ ${Number(product.price).toFixed(2)}`)
  const waLink  = `https://wa.me/${phone}?text=${waText}`

  return (
    <div className="dm-card group">
      {isNew  && <span className="dm-badge-new">Novo</span>}
      {hasOff && <span className="dm-badge-off">-{offPct}%</span>}

      {/* Image */}
      <div className="overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="dm-card-img"
            loading="lazy"
          />
        ) : (
          <div className="dm-card-img bg-dm-card flex items-center justify-center">
            <span className="text-dm-muted text-xs tracking-widest uppercase">Sem foto</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 md:p-5">
        {product.category && (
          <p className="text-[9px] tracking-[0.25em] uppercase text-dm-muted mb-1">{product.category}</p>
        )}
        <h3 className="font-medium text-[15px] mb-1 leading-snug">{product.title}</h3>

        {product.description && (
          <p className="text-[11px] text-dm-white/45 mb-3 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-dm-gold font-semibold text-lg">
            R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {hasOff && (
            <span className="text-dm-muted text-xs line-through">
              R$ {Number(product.price_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Sizes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`dm-size ${size === s ? 'active' : ''}`}
            >{s}</button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAdd}
            disabled={adding}
            className="dm-btn w-full text-[9px]"
          >
            <ShoppingBag size={13} />
            {adding ? 'Adicionado!' : 'Adicionar ao Carrinho'}
          </button>
          <a
            href={waLink}
            target="_blank" rel="noopener noreferrer"
            className="dm-btn-ghost w-full text-[9px]"
          >
            <MessageCircle size={13} />
            Solicitar via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
