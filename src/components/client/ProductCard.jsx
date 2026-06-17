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
  const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : SIZES

  async function handleAdd() {
    if (!size) { toast.error('Selecione um tamanho'); return }
    setAdding(true)
    addItem(product, size)
    toast.success(`${product.title} adicionado!`)
    setTimeout(() => setAdding(false), 600)
  }

  const phone   = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '5591983181896'
  const price = Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const wholesalePrice = product.price_wholesale
    ? Number(product.price_wholesale).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null
  const productDetails = [
    'Olá! Tenho interesse neste modelo da Cardoso Store:',
    '',
    `*${product.title}*`,
    product.category ? `Categoria: ${product.category}` : null,
    size ? `Tamanho escolhido: ${size}` : null,
    `Preço varejo: ${price}`,
    wholesalePrice ? `Preço atacado: ${wholesalePrice}` : null,
    product.description ? `Descrição: ${product.description}` : null,
  ].filter(Boolean).join('\n')
  const waText  = encodeURIComponent(productDetails)
  const waLink  = `https://wa.me/${phone}?text=${waText}`

  return (
    <div className="dm-card group">
      {isNew  && <span className="dm-badge-new">Novo</span>}
      {hasOff && <span className="dm-badge-off">-{offPct}%</span>}

      {/* Image */}
      <div className="relative overflow-hidden">
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
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          title={`Chamar no WhatsApp sobre ${product.title}`}
          aria-label={`Chamar no WhatsApp sobre ${product.title}`}
          className="absolute right-3 bottom-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-dm-black"
        >
          <MessageCircle size={22} strokeWidth={2.4} />
        </a>
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
          <div>
            <span className="text-dm-gold font-semibold text-lg">
              R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[9px] tracking-[0.18em] uppercase text-dm-muted">Varejo</p>
            {wholesalePrice && (
              <p className="mt-1 text-[11px] text-green-400">
                Atacado: {wholesalePrice}
              </p>
            )}
          </div>
          {hasOff && (
            <span className="text-dm-muted text-xs line-through">
              R$ {Number(product.price_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Sizes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {availableSizes.map(s => (
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
