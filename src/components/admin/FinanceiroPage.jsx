import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CreditCard, FileText, Plus, TrendingUp } from 'lucide-react'
import { getOrders } from '../../lib/orders'
import { getDespesas, getInvestimentos, createDespesa, createInvestimento } from '../../lib/finance'
import toast from 'react-hot-toast'

const ABAS = [
  { key: 'caixa', label: 'Caixa', icon: CreditCard },
  { key: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  { key: 'despesas', label: 'Despesas', icon: FileText },
  { key: 'roi', label: 'Retorno sobre Investimento (ROI)', icon: BarChart3 },
  { key: 'relatorios', label: 'Relatórios Financeiros', icon: BarChart3 },
]

const DESPESA_VAZIA = { title: '', amount: '', category: '', date: '', notes: '' }
const INVESTIMENTO_VAZIO = { title: '', amount: '', date: '', notes: '' }

export default function FinanceiroPage() {
  const [aba, setAba] = useState('caixa')
  const [orders, setOrders] = useState([])
  const [investimentos, setInvestimentos] = useState([])
  const [despesas, setDespesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [despesaForm, setDespesaForm] = useState(DESPESA_VAZIA)
  const [investimentoForm, setInvestimentoForm] = useState(INVESTIMENTO_VAZIO)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [ordersData, investimentosData, despesasData] = await Promise.allSettled([
      getOrders(),
      getInvestimentos(),
      getDespesas(),
    ])
    setOrders(ordersData.status === 'fulfilled' ? ordersData.value : [])
    setInvestimentos(investimentosData.status === 'fulfilled' ? investimentosData.value : [])
    setDespesas(despesasData.status === 'fulfilled' ? despesasData.value : [])
    setLoading(false)
  }

  const receitaTotal = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.total || 0), 0)
  }, [orders])

  const despesasTotais = useMemo(() => {
    return despesas.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [despesas])

  const capitalInvestido = useMemo(() => {
    return investimentos.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [investimentos])

  const lucroLiquido = receitaTotal - despesasTotais
  const roi = capitalInvestido > 0 ? (lucroLiquido / capitalInvestido) * 100 : 0

  async function handleSubmitDespesa(e) {
    e.preventDefault()
    if (!despesaForm.title.trim() || !despesaForm.amount || Number(despesaForm.amount) <= 0) {
      toast.error('Informe título e valor da despesa')
      return
    }
    setSaving(true)
    try {
      await createDespesa({
        title: despesaForm.title.trim(),
        amount: Number(despesaForm.amount),
        category: despesaForm.category.trim() || 'Geral',
        date: despesaForm.date || new Date().toISOString().slice(0, 10),
        notes: despesaForm.notes.trim(),
        created_at: new Date().toISOString(),
      })
      setDespesaForm(DESPESA_VAZIA)
      await loadData()
      toast.success('Despesa cadastrada')
    } catch (err) {
      toast.error('Erro ao cadastrar despesa')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitInvestimento(e) {
    e.preventDefault()
    if (!investimentoForm.title.trim() || !investimentoForm.amount || Number(investimentoForm.amount) <= 0) {
      toast.error('Informe título e valor do investimento')
      return
    }
    setSaving(true)
    try {
      await createInvestimento({
        title: investimentoForm.title.trim(),
        amount: Number(investimentoForm.amount),
        date: investimentoForm.date || new Date().toISOString().slice(0, 10),
        notes: investimentoForm.notes.trim(),
        created_at: new Date().toISOString(),
      })
      setInvestimentoForm(INVESTIMENTO_VAZIO)
      await loadData()
      toast.success('Investimento cadastrado')
    } catch (err) {
      toast.error('Erro ao cadastrar investimento')
    } finally {
      setSaving(false)
    }
  }

  const indicadores = [
    { label: 'Capital Investido', value: `R$ ${capitalInvestido.toFixed(2)}`, color: 'text-dm-gold' },
    { label: 'Receita Total', value: `R$ ${receitaTotal.toFixed(2)}`, color: 'text-green-400' },
    { label: 'Lucro Líquido', value: `R$ ${lucroLiquido.toFixed(2)}`, color: lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'ROI', value: `${roi.toFixed(2)}%`, color: 'text-purple-400' },
    { label: 'Despesas Totais', value: `R$ ${despesasTotais.toFixed(2)}`, color: 'text-red-400' },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl">Financeiro</h1>
        <p className="text-sm text-dm-muted mt-1">Controle de caixa, despesas, investimentos e ROI</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-7">
        {ABAS.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => setAba(item.key)}
            className={`dm-btn-ghost text-[10px] ${aba === item.key ? 'border-dm-gold text-dm-gold' : 'border-dm-border text-dm-muted'}`}
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dm-admin-card py-10 text-center text-dm-muted">Carregando...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {indicadores.map(card => (
              <div key={card.label} className="dm-stat">
                <p className="dm-stat-label">{card.label}</p>
                <p className={`dm-stat-value ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {aba === 'caixa' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Historico title="Histórico financeiro" items={[...despesas, ...investimentos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))} />
              <ResumoFinanceiro receita={receitaTotal} despesas={despesasTotais} lucro={lucroLiquido} />
            </div>
          )}

          {aba === 'investimentos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormularioInvestimento form={investimentoForm} setForm={setInvestimentoForm} saving={saving} onSubmit={handleSubmitInvestimento} />
              <Historico title="Investimentos registrados" items={investimentos} />
            </div>
          )}

          {aba === 'despesas' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormularioDespesa form={despesaForm} setForm={setDespesaForm} saving={saving} onSubmit={handleSubmitDespesa} />
              <Historico title="Histórico de despesas" items={despesas} />
            </div>
          )}

          {aba === 'roi' && (
            <ResumoFinanceiro receita={receitaTotal} despesas={despesasTotais} lucro={lucroLiquido} capital={capitalInvestido} roi={roi} />
          )}

          {aba === 'relatorios' && (
            <ResumoFinanceiro receita={receitaTotal} despesas={despesasTotais} lucro={lucroLiquido} capital={capitalInvestido} roi={roi} detalhado />
          )}
        </div>
      )}
    </div>
  )
}

function FormularioInvestimento({ form, setForm, saving, onSubmit }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Controle de investimentos</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Campo label="Título" value={form.title} onChange={value => setForm(f => ({ ...f, title: value }))} placeholder="Ex: Compra de mercadoria" />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Valor (R$)" type="number" value={form.amount} onChange={value => setForm(f => ({ ...f, amount: value }))} placeholder="0.00" />
          <Campo label="Data" type="date" value={form.date} onChange={value => setForm(f => ({ ...f, date: value }))} />
        </div>
        <Area label="Observações" value={form.notes} onChange={value => setForm(f => ({ ...f, notes: value }))} placeholder="Detalhes do investimento" />
        <button type="submit" disabled={saving} className="dm-btn gap-2 text-[10px]">
          <Plus size={14} /> {saving ? 'Salvando...' : 'Cadastrar investimento'}
        </button>
      </form>
    </div>
  )
}

function FormularioDespesa({ form, setForm, saving, onSubmit }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Cadastro de despesas</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Campo label="Título" value={form.title} onChange={value => setForm(f => ({ ...f, title: value }))} placeholder="Ex: Conta de luz" />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Valor (R$)" type="number" value={form.amount} onChange={value => setForm(f => ({ ...f, amount: value }))} placeholder="0.00" />
          <Campo label="Data" type="date" value={form.date} onChange={value => setForm(f => ({ ...f, date: value }))} />
        </div>
        <Campo label="Categoria" value={form.category} onChange={value => setForm(f => ({ ...f, category: value }))} placeholder="Ex: Energia" />
        <Area label="Observações" value={form.notes} onChange={value => setForm(f => ({ ...f, notes: value }))} placeholder="Detalhes da despesa" />
        <button type="submit" disabled={saving} className="dm-btn gap-2 text-[10px]">
          <Plus size={14} /> {saving ? 'Salvando...' : 'Cadastrar despesa'}
        </button>
      </form>
    </div>
  )
}

function Campo({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <div>
      <label className="dm-label">{label}</label>
      <input type={type} step={type === 'number' ? '0.01' : undefined} min={type === 'number' ? '0' : undefined} value={value} onChange={e => onChange(e.target.value)} className="dm-input" placeholder={placeholder} />
    </div>
  )
}

function Area({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="dm-label">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} className="dm-input resize-none" rows={4} placeholder={placeholder} />
    </div>
  )
}

function Historico({ title, items }) {
  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-dm-muted text-sm">Nenhum registro encontrado.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 12).map(item => (
            <div key={item.id} className="border-b border-dm-border pb-3 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[13px]">{item.title}</p>
                <p className="text-dm-gold">R$ {Number(item.amount).toFixed(2)}</p>
              </div>
              <p className="text-[10px] text-dm-muted">{item.category || 'Investimento'} • {new Date(item.date || item.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResumoFinanceiro({ receita, despesas, lucro, capital = 0, roi = 0, detalhado = false }) {
  const linhas = [
    ['Receita', receita],
    ['Despesas', despesas],
    ['Lucro Líquido', lucro],
  ]
  if (detalhado) {
    linhas.push(['Capital Investido', capital], ['ROI (%)', roi])
  }

  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Relatório financeiro</h2>
      <div className="space-y-3">
        {linhas.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm text-dm-muted border-b border-dm-border pb-2 last:border-0">
            <span>{label}</span>
            <span className="text-dm-white">{label === 'ROI (%)' ? `${Number(value).toFixed(2)}%` : `R$ ${Number(value).toFixed(2)}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
