import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react'
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../lib/products'
import { deleteImage } from '../../lib/storage'
import ImageUpload from '../shared/ImageUpload'
import toast from 'react-hot-toast'

const CLOTHING_SIZES = ['P', 'M', 'G', 'GG', 'XGG']
const SHOE_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
const BLANK = { title: '', description: '', price: '', price_wholesale: '', price_original: '', category: '', image_url: '', sizes: [], active: true }
const CATEGORIES = ['Oversized', 'Polos Premium', 'Camisetas', 'Calças', 'Acessórios', 'Outros']

export default function ProductsPage() {
  const [products, setProducts]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [modal,    setModal]      = useState(false)
  const [editing,  setEditing]    = useState(null) // produto sendo editado
  const [form,     setForm]       = useState(BLANK)
  const [saving,   setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    try { setProducts(await getAllProducts()) }
    catch (e) { toast.error('Erro ao carregar produtos: ' + e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(BLANK)
    setModal(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      title:          p.title         || '',
      description:    p.description   || '',
      price:          String(p.price) || '',
      price_wholesale: p.price_wholesale ? String(p.price_wholesale) : '',
      price_original: p.price_original ? String(p.price_original) : '',
      category:       p.category      || '',
      image_url:      p.image_url     || '',
      sizes:          Array.isArray(p.sizes) ? p.sizes : [],
      active:         p.active !== false,
    })
    setModal(true)
  }

  function closeModal() { setModal(false); setEditing(null) }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSizeToggle(size) {
    setForm(f => {
      const sizes = Array.isArray(f.sizes) ? f.sizes : []
      return {
        ...f,
        sizes: sizes.includes(size)
          ? sizes.filter(item => item !== size)
          : [...sizes, size],
      }
    })
  }

  async function handleSave() {
    if (!form.title.trim())         { toast.error('Informe o título');    return }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Informe um preço válido'); return }
    if (!form.sizes.length) { toast.error('Selecione pelo menos um tamanho disponível'); return }

    setSaving(true)
    try {
      const payload = {
        title:          form.title.trim(),
        description:    form.description.trim(),
        price:          Number(form.price),
        price_wholesale: form.price_wholesale ? Number(form.price_wholesale) : null,
        price_original: form.price_original ? Number(form.price_original) : null,
        category:       form.category.trim(),
        image_url:      form.image_url,
        sizes:          form.sizes,
        active:         form.active,
      }

      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success('Produto atualizado!')
      } else {
        await createProduct(payload)
        toast.success('Produto criado!')
      }

      await load()
      closeModal()
    } catch (e) {
      toast.error('Erro: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(p) {
    try {
      await updateProduct(p.id, { active: !p.active })
      await load()
      toast.success(p.active ? 'Produto ocultado' : 'Produto ativado')
    } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(p) {
    if (!confirm(`Excluir "${p.title}"? Isso não pode ser desfeito.`)) return
    try {
      if (p.image_url) await deleteImage(p.image_url)
      await deleteProduct(p.id)
      await load()
      toast.success('Produto excluído')
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-serif text-3xl">Produtos</h1>
          <p className="text-sm text-dm-muted mt-1">{products.length} peças cadastradas</p>
        </div>
        <button onClick={openAdd} className="dm-btn gap-2 text-[10px]">
          <Plus size={15} /> Adicionar
        </button>
      </div>

      {/* Table */}
      <div className="dm-admin-card overflow-hidden p-0">
        {loading ? (
          <p className="px-5 py-8 text-dm-muted text-sm">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className="hidden sm:table-cell">Categoria</th>
                  <th>Preços</th>
                  <th className="hidden md:table-cell">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-dm-muted text-sm">
                    Nenhum produto. Clique em Adicionar para criar o primeiro.
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-9 h-11 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-11 bg-dm-border flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-[13px]">{p.title}</p>
                          {p.description && (
                            <p className="text-[10px] text-dm-muted truncate max-w-[180px]">{p.description}</p>
                          )}
                          {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                            <p className="text-[10px] text-dm-gold mt-0.5">Tamanhos: {p.sizes.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-dm-muted text-[11px]">{p.category || '—'}</td>
                    <td>
                      <p className="text-dm-gold text-[13px]">Varejo: R$ {Number(p.price).toFixed(2)}</p>
                      {p.price_wholesale && (
                        <p className="text-green-400 text-[10px]">Atacado: R$ {Number(p.price_wholesale).toFixed(2)}</p>
                      )}
                      {p.price_original && (
                        <p className="text-dm-muted text-[10px] line-through">R$ {Number(p.price_original).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="hidden md:table-cell">
                      <span className={`text-[9px] px-2 py-0.5 border ${p.active ? 'border-green-800 text-green-400 bg-green-900/20' : 'border-dm-border text-dm-muted'}`}>
                        {p.active ? 'Ativo' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleToggleActive(p)} className="p-1.5 text-dm-muted hover:text-dm-white" title={p.active ? 'Ocultar' : 'Ativar'}>
                          {p.active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-dm-muted hover:text-dm-gold" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-dm-muted hover:text-red-400" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 overflow-y-auto">
          <div className="w-full max-w-lg bg-dm-dark border border-dm-border my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dm-border">
              <h2 className="text-[10px] tracking-[0.2em] uppercase">
                {editing ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={closeModal}><X size={18} className="text-dm-muted" /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image upload */}
              <ImageUpload
                currentUrl={form.image_url}
                onUploaded={url => setForm(f => ({ ...f, image_url: url }))}
                folder="products"
                label="Foto do Produto"
              />

              <div>
                <label className="dm-label">Título *</label>
                <input name="title" value={form.title} onChange={handleChange} className="dm-input" placeholder="Ex: Camisa Oversized Premium" />
              </div>

              <div>
                <label className="dm-label">Descrição</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="dm-input resize-none" placeholder="Descrição do produto..." />
              </div>

              <div>
                <label className="dm-label">Tamanhos disponíveis *</label>
                <SizeGroup
                  title="Roupas"
                  sizes={CLOTHING_SIZES}
                  selected={form.sizes}
                  onToggle={handleSizeToggle}
                />
                <SizeGroup
                  title="Calçados"
                  sizes={SHOE_SIZES}
                  selected={form.sizes}
                  onToggle={handleSizeToggle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="dm-label">Preço varejo (R$) *</label>
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="dm-input" placeholder="0.00" inputMode="decimal" />
                </div>
                <div>
                  <label className="dm-label">Preço atacado (R$)</label>
                  <input name="price_wholesale" type="number" step="0.01" min="0" value={form.price_wholesale} onChange={handleChange} className="dm-input" placeholder="0.00" inputMode="decimal" />
                </div>
                <div>
                  <label className="dm-label">Preço original (opcional)</label>
                  <input name="price_original" type="number" step="0.01" min="0" value={form.price_original} onChange={handleChange} className="dm-input" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>

              <div>
                <label className="dm-label">Categoria</label>
                <div className="flex gap-2">
                  <input name="category" value={form.category} onChange={handleChange} className="dm-input flex-1" placeholder="Ex: Oversized" list="cat-list" />
                  <datalist id="cat-list">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-dm-gold" />
                <span className="text-[11px] text-dm-muted">Produto visível na loja</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end px-5 py-4 border-t border-dm-border">
              <button onClick={closeModal} className="dm-btn-ghost text-[10px]">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="dm-btn text-[10px]">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SizeGroup({ title, sizes, selected, onToggle }) {
  return (
    <div className="mt-3">
      <p className="text-[10px] text-dm-muted mb-2">{title}</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {sizes.map(size => (
          <label
            key={size}
            className={`flex items-center justify-center gap-2 border px-3 py-2 text-[10px] font-medium cursor-pointer transition-colors ${
              selected.includes(size)
                ? 'border-dm-gold text-dm-gold bg-dm-gold/10'
                : 'border-dm-border text-dm-muted hover:border-dm-gold/60 hover:text-dm-white'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(size)}
              onChange={() => onToggle(size)}
              className="w-3.5 h-3.5 accent-dm-gold"
            />
            {size}
          </label>
        ))}
      </div>
    </div>
  )
}
