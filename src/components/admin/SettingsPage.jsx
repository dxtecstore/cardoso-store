import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { setSettings } from '../../lib/settings'
import { useSettings } from '../../context/SettingsContext'
import ImageUpload from '../shared/ImageUpload'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { settings, reload } = useSettings()
  const [form, setForm] = useState(() => ({ ...settings }))
  const [saving, setSaving] = useState(false)

  // Sync form when settings load for first time
  const [initialized, setInitialized] = useState(false)

useEffect(() => {
  if (!initialized && settings) {
    setForm({ ...settings })
    setInitialized(true)
  }
}, [settings, initialized])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await setSettings(form)
      await reload()
      toast.success('Configurações salvas!')
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const Section = ({ title, children }) => (
    <div className="dm-admin-card mb-5">
      <h2 className="text-[10px] tracking-[0.2em] uppercase text-dm-muted mb-4 pb-3 border-b border-dm-border">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )

  const Field = ({ label, name, placeholder, type = 'text', hint }) => (
    <div>
      <label className="dm-label">{label}</label>
      <input
        name={name}
        type={type}
        value={form[name] || ''}
        onChange={handleChange}
        className="dm-input"
        placeholder={placeholder}
        inputMode={type === 'tel' ? 'tel' : undefined}
      />
      {hint && <p className="text-[10px] text-dm-muted mt-1">{hint}</p>}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-serif text-3xl">Configurações</h1>
          <p className="text-sm text-dm-muted mt-1">Personalize sua loja</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="dm-btn gap-2 text-[10px]">
          <Save size={14} />
          {saving ? 'Salvando...' : 'Salvar tudo'}
        </button>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">

        {/* Identidade */}
        <Section title="Identidade da Loja">
          <Field label="Nome da loja" name="store_name" placeholder="Cardoso Store" />

          <div>
            <ImageUpload
              currentUrl={form.logo_url || ''}
              onUploaded={url => setForm(f => ({ ...f, logo_url: url }))}
              folder="logos"
              label="Logo da Loja"
            />
            <p className="text-[10px] text-dm-muted mt-1">
              Aparece no topo da loja e no painel. PNG com fundo transparente recomendado.
            </p>
          </div>
        </Section>

        {/* Contato */}
        <Section title="Contato & Redes Sociais">
          <Field
            label="WhatsApp (somente números com DDD)"
            name="whatsapp"
            placeholder="5585999999999"
            type="tel"
            hint="Ex: 5585999999999 (55 = Brasil, 85 = Fortaleza)"
          />
          <Field
            label="Instagram (sem @)"
            name="instagram"
            placeholder="cardoso.store"
          />
          <Field
            label="Endereço / localização"
            name="address"
            placeholder="Rua exemplo, 123 — Fortaleza, CE"
          />
        </Section>

        {/* Hero */}
        <Section title="Seção Principal (Hero)">
          <Field
            label="Título principal"
            name="hero_title"
            placeholder="Vista Presença."
            hint="Use um ponto para separar texto normal de texto em itálico dourado. Ex: Vista Presença. → 'Vista' normal + 'Presença.' dourado"
          />
          <Field
            label="Subtítulo"
            name="hero_sub"
            placeholder="Moda premium multimarcas. Elegância em cada detalhe."
          />
          <Field
            label="Texto do botão principal"
            name="hero_cta"
            placeholder="Ver Catálogo"
          />

          <div>
            <ImageUpload
              currentUrl={form.banner_url || ''}
              onUploaded={url => setForm(f => ({ ...f, banner_url: url }))}
              folder="banners"
              label="Imagem de fundo do Hero (opcional)"
            />
            <p className="text-[10px] text-dm-muted mt-1">
              Aparecerá como fundo semi-transparente na seção principal.
            </p>
          </div>
        </Section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="dm-btn gap-2">
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
