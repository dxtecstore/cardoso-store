import { useSettings } from '../../context/SettingsContext'

export default function Footer() {
  const { settings } = useSettings()
  const name = settings.store_name || 'Cardoso Store'
  const wa   = settings.whatsapp   || ''
  const ig   = settings.instagram  || ''

  return (
    <footer className="border-t border-dm-border bg-dm-dark py-14 px-5 md:px-10 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
        <div>
          {settings.logo_url
            ? <img src={settings.logo_url} alt={name} className="h-10 object-contain mb-4" />
            : <p className="font-serif text-dm-gold text-lg tracking-widest uppercase mb-4">{name}</p>
          }
          <p className="text-[11px] text-dm-muted leading-relaxed">
            Moda premium multimarcas. Elegância em cada detalhe para o homem contemporâneo.
          </p>
        </div>

        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-dm-white mb-4">Navegação</p>
          {['Catálogo', 'Coleções', 'Sobre'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="block text-[11px] text-dm-muted hover:text-dm-gold mb-2 transition-colors">
              {l}
            </a>
          ))}
        </div>

        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-dm-white mb-4">Contato</p>
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-dm-muted hover:text-dm-gold mb-2 transition-colors">
              WhatsApp
            </a>
          )}
          {ig && (
            <a href={`https://instagram.com/${ig.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-dm-muted hover:text-dm-gold mb-2 transition-colors">
              @{ig.replace('@', '')}
            </a>
          )}
          {settings.address && (
            <p className="text-[11px] text-dm-muted">{settings.address}</p>
          )}
        </div>
      </div>

      <div className="border-t border-dm-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-[10px] text-dm-muted">© {new Date().getFullYear()} {name}. Todos os direitos reservados.</p>
        <a href="/admin" className="text-[10px] text-dm-muted/30 hover:text-dm-muted transition-colors">Admin</a>
      </div>
    </footer>
  )
}
