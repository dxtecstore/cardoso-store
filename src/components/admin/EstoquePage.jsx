import { useEffect, useMemo, useState } from 'react'
import { getEstoque, getMovimentacoesEstoque, saveMovimentacaoEstoque } from '../../lib/estoque'
import { getAllProducts } from '../../lib/products'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const ABAS = ['Produtos em Estoque', 'Entradas', 'Saídas', 'Alertas', 'Relatórios']

export default function EstoquePage() {
  const [aba, setAba] = useState('Produtos em Estoque')
  const [estoque, setEstoque] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ product_id: '', type: 'entrada', qty: 1, cost: 0, notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [estoqueData, movData, productsData] = await Promise.allSettled([
      getEstoque(),
      getMovimentacoesEstoque(),
      getAllProducts(),
    ])
    setEstoque(estoqueData.status === 'fulfilled' ? estoqueData.value : [])
    setMovimentacoes(movData.status === 'fulfilled' ? movData.value : [])
    setProducts(productsData.status === 'fulfilled' ? productsData.value : [])
    setLoading(false)
  }

  const valorEstocado = useMemo(() => {
    return estoque.reduce((sum, item) => sum + Number(item.available_qty || 0) * Number(item.unit_cost || 0), 0)
  }, [estoque])

  const produtosBaixoEstoque = useMemo(() => {
    return estoque.filter(i => Number(i.available_qty || 0) <= Number(i.alert_threshold ?? 5))
  }, [estoque])

  const produtoMaisVendido = useMemo(() => {
    const saidas = movimentacoes.filter(m => m.type === 'saida')
    const map = new Map()
    saidas.forEach(m => map.set(m.product_id, (map.get(m.product_id) || 0) + Number(m.qty || 0)))
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0] || null
  }, [movimentacoes])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.product_id) {
      toast.error('Selecione um produto')
      return
    }
    setSaving(true)
    try {
      await saveMovimentacaoEstoque({
        product_id: form.product_id,
        type: form.type,
        qty: Number(form.qty),
        cost: Number(form.cost),
        notes: form.notes,
        created_at: new Date().toISOString(),
      })
      setForm({ product_id: '', type: 'entrada', qty: 1, cost: 0, notes: '' })
      await load()
      toast.success('Movimentação registrada')
    } catch (err) {
      toast.error('Erro ao registrar movimentação')
    } finally {
      setSaving(false)
    }
  }

  function nomeProduto(productId) {
    return products.find(p => p.id === productId)?.title || 'Produto não encontrado'
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Estoque</h1>
        <p className="text-sm text-dm-muted mt-1">Controle inteligente de produtos, entradas, saídas e alertas</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-7">
        {ABAS.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setAba(item)}
            className={`dm-btn-ghost text-[10px] ${aba === item ? 'border-dm-gold text-dm-gold' : 'border-dm-border text-dm-muted'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dm-admin-card py-10 text-center text-dm-muted">Carregando...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card label="Valor Total em Estoque" value={`R$ ${valorEstocado.toFixed(2)}`} color="text-dm-gold" />
            <Card label="Produtos com Estoque Baixo" value={produtosBaixoEstoque.length} color="text-red-400" />
            <Card label="Produto Mais Vendido" value={produtoMaisVendido ? nomeProduto(produtoMaisVendido[0]) : '—'} color="text-orange-400" />
          </div>

          {aba === 'Produtos em Estoque' && (
            <ListaEstoque estoque={estoque} nomeProduto={nomeProduto} products={products} />
          )}

          {(aba === 'Entradas' || aba === 'Saídas') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormularioMovimentacao
                form={{ ...form, type: aba === 'Entradas' ? 'entrada' : 'saida' }}
                setForm={setForm}
                products={products}
                saving={saving}
                onSubmit={handleSubmit}
              />
              <ListaMovimentacoes
                movimentacoes={movimentacoes.filter(m => m.type === (aba === 'Entradas' ? 'entrada' : 'saida'))}
                nomeProduto={nomeProduto}
              />
            </div>
          )}

          {aba === 'Alertas' && (
            <ListaEstoque estoque={produtosBaixoEstoque} nomeProduto={nomeProduto} products={products} alerta />
          )}

          {aba === 'Relatórios' && (
            <RelatorioEstoque
              estoque={estoque}
              movimentacoes={movimentacoes}
              nomeProduto={nomeProduto}
              produtoMaisVendido={produtoMaisVendido}
              valorEstocado={valorEstocado}
            />
          )}
        </div>
      )}
    </div>
  )
}

function Card({ label, value, color }) {
  return (
    <div className="dm-admin-card">
      <p className="dm-stat-label">{label}</p>
      <p className={`dm-stat-value ${color}`}>{value}</p>
    </div>
  )
}

function FormularioMovimentacao({ form, setForm, products, saving, onSubmit }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Registrar movimentação</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="dm-label">Produto</label>
          <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value, type: form.type }))} className="dm-input">
            <option value="">Selecione</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="dm-label">Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="dm-input">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label className="dm-label">Quantidade</label>
            <input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} className="dm-input" />
          </div>
          <div>
            <label className="dm-label">Custo unitário (R$)</label>
            <input type="number" step="0.01" min="0" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="dm-input" />
          </div>
        </div>
        <div>
          <label className="dm-label">Observações</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="dm-input resize-none" rows={3} />
        </div>
        <button type="submit" disabled={saving} className="dm-btn gap-2">
          <Plus size={14} /> {saving ? 'Salvando...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}

function ListaMovimentacoes({ movimentacoes, nomeProduto }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Histórico de movimentação</h2>
      {movimentacoes.length === 0 ? (
        <p className="text-dm-muted">Sem movimentações.</p>
      ) : (
        <div className="space-y-3">
          {movimentacoes.slice(0, 12).map(m => (
            <div key={m.id} className="border-b border-dm-border pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <p className="text-[13px]">{nomeProduto(m.product_id)}</p>
                <p className="text-dm-gold">{m.type === 'entrada' ? '+' : '-'}{m.qty}</p>
              </div>
              <p className="text-[10px] text-dm-muted">{new Date(m.created_at).toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ListaEstoque({ estoque, nomeProduto, alerta = false }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">{alerta ? 'Alertas de estoque baixo' : 'Produtos em estoque'}</h2>
      {estoque.length === 0 ? (
        <p className="text-dm-muted">{alerta ? 'Nenhum alerta de estoque baixo.' : 'Nenhum item de estoque cadastrado.'}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {estoque.map(item => {
            const quantidade = Number(item.available_qty || 0)
            const custo = Number(item.unit_cost || 0)
            const valorInvestido = quantidade * custo
            return (
              <div key={item.id} className="p-3 border border-dm-border">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[13px]">{nomeProduto(item.product_id)}</p>
                    <p className="text-[11px] text-dm-muted">Quantidade disponível: {quantidade}</p>
                    <p className="text-[11px] text-dm-muted">Custo unitário: R$ {custo.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-dm-gold">R$ {valorInvestido.toFixed(2)}</p>
                    <p className="text-[11px] text-dm-muted">Alerta: {item.alert_threshold}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RelatorioEstoque({ estoque, movimentacoes, nomeProduto, produtoMaisVendido, valorEstocado }) {
  const semMovimentacao = estoque.filter(item => !movimentacoes.some(m => m.product_id === item.product_id))
  const lucroPotencial = estoque.reduce((sum, item) => sum + Number(item.available_qty || 0) * Number(item.unit_cost || 0), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="dm-admin-card">
        <h2 className="text-sm font-semibold mb-4">Relatório do estoque</h2>
        <div className="space-y-3 text-sm text-dm-muted">
          <Linha label="Valor investido por produto" value="Disponível na lista de estoque" />
          <Linha label="Valor total investido" value={`R$ ${valorEstocado.toFixed(2)}`} />
          <Linha label="Lucro potencial" value={`R$ ${lucroPotencial.toFixed(2)}`} />
          <Linha label="Produto mais vendido" value={produtoMaisVendido ? nomeProduto(produtoMaisVendido[0]) : '—'} />
        </div>
      </div>
      <div className="dm-admin-card">
        <h2 className="text-sm font-semibold mb-4">Produtos sem movimentação</h2>
        {semMovimentacao.length === 0 ? (
          <p className="text-dm-muted text-sm">Todos os produtos em estoque possuem movimentação.</p>
        ) : (
          <div className="space-y-2">
            {semMovimentacao.slice(0, 10).map(item => (
              <p key={item.id} className="text-[13px] text-dm-muted">{nomeProduto(item.product_id)}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Linha({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dm-border pb-2 last:border-0">
      <span>{label}</span>
      <span className="text-dm-white">{value}</span>
    </div>
  )
}
