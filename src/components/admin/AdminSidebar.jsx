import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Layers,
  BarChart3,
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useSettings } from '../../context/SettingsContext'

const LINKS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Painel Inicial' },
  { to: '/admin/products', icon: Package, label: 'Produtos' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/admin/estoque', icon: Layers, label: 'Estoque' },
  { to: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/admin/settings', icon: Settings, label: 'Configurações' },
]

export default function AdminSidebar() {
  const { logout } = useAdmin()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin')
  }

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-dm-border">
        {settings.logo_url
          ? <img src={settings.logo_url} alt={settings.store_name} className="h-8 object-contain" />
          : <span className="font-serif text-dm-gold text-base tracking-widest uppercase">{settings.store_name || 'Cardoso Store'}</span>
        }
        <p className="text-[9px] tracking-[0.2em] uppercase text-dm-muted mt-1">Admin</p>
      </div>

      <nav className="flex-1 py-3">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `dm-admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dm-border space-y-1">
        <button onClick={handleLogout} className="dm-admin-nav-item w-full text-red-400/60 hover:text-red-400">
          <LogOut size={15} />
          Sair
        </button>
        <a href="/" className="dm-admin-nav-item block text-[10px] text-dm-muted/40 hover:text-dm-muted">
          ← Ver a loja
        </a>
      </div>
    </>
  )

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-dm-dark border border-dm-border text-dm-white"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Menu admin"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className="dm-admin-sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-64 bg-dm-dark border-r border-dm-border flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
