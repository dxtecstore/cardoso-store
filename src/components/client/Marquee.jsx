import { useSettings } from '../../context/SettingsContext'

const DEFAULT_ITEMS = [
  'Cardoso Store',
  'Qualidade Premium',
  'Estilo Exclusivo',
  'Luxo Discreto',
  'Moda Masculina',
  'Nova Coleção 2025',
]

export default function Marquee() {
  const { settings } = useSettings()
  const name  = settings.store_name || 'Cardoso Store'
  const items = DEFAULT_ITEMS.map(i => i === 'Cardoso Store' ? name : i)
  const doubled = [...items, ...items]

  return (
    <div className="dm-marquee">
      <div className="dm-marquee-track">
        {doubled.map((text, i) => (
          <span key={i} className="dm-marquee-item">
            {text}
            <span className="dm-marquee-dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
