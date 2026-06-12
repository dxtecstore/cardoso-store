import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart }     from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'

export default function Navbar() {
  const { count, setIsOpen } = useCart()
  const { settings }         = useSettings()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Catálogo',  href: '#produtos' },
    { label: 'Coleções',  href: '#colecoes' },
    { label: 'Sobre',     href: '#sobre' },
  ]

  return (
    <>
      <nav className={`dm-nav ${scrolled ? 'scrolled' : ''}`}>
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          {settings.logo_url
            ? <img src={settings.logo_url} alt={settings.store_name} className="h-9 w-auto object-contain" />
            : <span className="dm-logo-text">{settings.store_name || 'Cardoso Store'}</span>
          }
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href} className="dm-nav-link">{l.label}</a>
          ))}
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="dm-nav-link"
            >WhatsApp</a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-dm-white/70 hover:text-dm-gold transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold bg-dm-gold text-dm-black">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          <button
            className="md:hidden p-2 text-dm-white/60 hover:text-dm-gold"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-dm-black/97 flex flex-col items-center justify-center gap-8 md:hidden">
          <button
            className="absolute top-5 right-5 text-dm-white/50 hover:text-dm-white"
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} />
          </button>

          {settings.logo_url
            ? <img src={settings.logo_url} alt={settings.store_name} className="h-14 object-contain mb-2" />
            : <span className="dm-logo-text text-2xl mb-2">{settings.store_name}</span>
          }

          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm tracking-[0.3em] uppercase text-dm-white/60 hover:text-dm-gold transition-colors"
              onClick={() => setMobileOpen(false)}
            >{l.label}</a>
          ))}
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="dm-btn mt-4"
              onClick={() => setMobileOpen(false)}
            >Falar no WhatsApp</a>
          )}
        </div>
      )}
    </>
  )
}
