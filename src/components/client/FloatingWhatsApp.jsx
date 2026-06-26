import { MessageCircle } from 'lucide-react'
import { STORE_WHATSAPP } from '../../lib/whatsapp'

export default function FloatingWhatsApp() {
  const phone = STORE_WHATSAPP
  const message = encodeURIComponent(
    'Olá! Vim pelo site da Cardoso Store e gostaria de atendimento.'
  )

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Cardoso Store pelo WhatsApp"
      title="Falar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_35px_rgba(37,211,102,0.45)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-dm-black md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <MessageCircle size={28} strokeWidth={2.4} />
    </a>
  )
}
