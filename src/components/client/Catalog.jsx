import { useState } from 'react'
import ProductCard  from './ProductCard'
import { useProducts } from '../../hooks/useProducts'

const ALL = 'Todos'

export default function Catalog() {
  const { products, loading, error } = useProducts()
  const [filter, setFilter] = useState(ALL)

  // Gera filtros dinamicamente com base nas categorias existentes
  const categories = [ALL, ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = filter === ALL
    ? products
    : products.filter(p => p.category === filter)

  return (
    <section id="produtos" className="dm-section">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="dm-eyebrow mb-3">Catálogo</p>
        <h2 className="dm-section-title mb-3">Peças <em>Selecionadas.</em></h2>
        <div className="dm-divider mx-auto" />
      </div>

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 text-[9px] tracking-[0.18em] uppercase transition-all ${
                filter === cat
                  ? 'bg-dm-gold text-dm-black font-semibold'
                  : 'border border-dm-border text-dm-muted hover:border-dm-gold/50 hover:text-dm-white'
              }`}
            >{cat}</button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm mb-2">Erro ao carregar produtos</p>
          <p className="text-dm-muted text-xs">{error}</p>
          <p className="text-dm-muted text-xs mt-2">Verifique se o Supabase está configurado corretamente.</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="dm-card animate-pulse">
              <div className="bg-dm-border" style={{ aspectRatio: '3/4' }} />
              <div className="p-5 space-y-3">
                <div className="h-2.5 bg-dm-border rounded w-1/3" />
                <div className="h-4 bg-dm-border rounded w-3/4" />
                <div className="h-2.5 bg-dm-border rounded w-full" />
                <div className="h-6 bg-dm-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-dm-muted text-sm">
                {filter === ALL
                  ? 'Nenhum produto cadastrado ainda.'
                  : `Nenhum produto em "${filter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </>
      )}
    </section>
  )
}
