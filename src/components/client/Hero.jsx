import { useSettings } from '../../context/SettingsContext'

export default function Hero() {
  const { settings } = useSettings()

  return (
    <section className="dm-hero" id="hero">
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-0 w-px h-52 bg-gradient-to-b from-transparent via-dm-gold/20 to-transparent" />
        <div className="absolute top-1/3 right-0 w-px h-64 bg-gradient-to-b from-transparent via-dm-gold/15 to-transparent" />
        <div className="absolute bottom-40 left-1/3 w-28 h-px bg-gradient-to-r from-transparent via-dm-gold/35 to-transparent" />
        <div className="absolute top-20 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-dm-gold/10 to-transparent" />
      </div>

      {/* Banner image (if set) */}
      {settings.banner_url && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={settings.banner_url}
            alt="Banner"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dm-black/60 via-dm-black/40 to-dm-black/80" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Eyebrow */}
        <p className="dm-eyebrow mb-5 animate-fade-in">
          {settings.store_name || 'Cardoso Store'}
        </p>

        {/* Title */}
        <h1 className="dm-section-title text-5xl md:text-7xl lg:text-8xl mb-6 animate-slide-up">
          {settings.hero_title
            ? settings.hero_title.includes('.')
              ? <>
                  {settings.hero_title.split('.')[0]}.{' '}
                  <em>{settings.hero_title.split('.').slice(1).join('.').trim()}</em>
                </>
              : <em>{settings.hero_title}</em>
            : <>Vista <em>Presença.</em></>
          }
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg text-sm text-dm-white/50 leading-relaxed tracking-wide mb-10 animate-fade-in">
          {settings.hero_sub || 'Moda premium multimarcas. Elegância em cada detalhe.'}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <a href="#produtos" className="dm-btn">
            {settings.hero_cta || 'Ver Catálogo'}
          </a>
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="dm-btn-outline"
            >WhatsApp</a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in">
        <span className="text-[9px] tracking-[0.4em] uppercase text-dm-white/20">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-dm-gold/40 to-transparent" />
      </div>
    </section>
  )
}
