import { useSettings } from '../../context/SettingsContext'

export default function About() {
  const { settings } = useSettings()
  const name = settings.store_name || 'Cardoso Store'
  const wa   = settings.whatsapp   || ''
  const ig   = settings.instagram  || ''

  return (
    <section id="sobre" className="dm-section bg-dm-dark">
      <div className="max-w-4xl mx-auto text-center">
        <p className="dm-eyebrow mb-4">Sobre Nós</p>
        <h2 className="dm-section-title mb-4">
          Uma marca. <em>Uma identidade.</em>
        </h2>
        <div className="dm-divider mx-auto mb-8" />
        <p className="text-sm text-dm-white/55 leading-relaxed max-w-xl mx-auto mb-10">
          {name} é referência em moda masculina premium multimarcas.
          Selecionamos peças de alto padrão para o homem contemporâneo que valoriza qualidade,
          estilo e o luxo discreto do bem vestir.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="dm-btn">
              Falar no WhatsApp
            </a>
          )}
          {ig && (
            <a
              href={`https://instagram.com/${ig.replace('@', '')}`}
              target="_blank" rel="noopener noreferrer"
              className="dm-btn-outline"
            >
              Instagram
            </a>
          )}
        </div>

        {settings.address && (
          <p className="text-[11px] text-dm-muted mt-8 tracking-wide">{settings.address}</p>
        )}
      </div>
    </section>
  )
}
