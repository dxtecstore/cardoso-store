import Navbar     from '../../components/client/Navbar'
import Hero        from '../../components/client/Hero'
import Marquee     from '../../components/client/Marquee'
import Catalog     from '../../components/client/Catalog'
import About       from '../../components/client/About'
import Footer      from '../../components/client/Footer'
import CartDrawer  from '../../components/client/CartDrawer'
import FloatingWhatsApp from '../../components/client/FloatingWhatsApp'

export default function Home() {
  return (
    <div className="min-h-screen bg-dm-black text-dm-white">
      <Navbar />
      <Hero />
      <Marquee />
      <Catalog />
      <About />
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  )
}
