import { Routes, Route, Navigate } from 'react-router-dom'
import AdminSidebar  from '../../components/admin/AdminSidebar'
import DashboardPage from '../../components/admin/DashboardPage'
import ProductsPage  from '../../components/admin/ProductsPage'
import OrdersPage    from '../../components/admin/OrdersPage'
import FinanceiroPage from '../../components/admin/FinanceiroPage'
import EstoquePage    from '../../components/admin/EstoquePage'
import RelatoriosPage from '../../components/admin/RelatoriosPage'
import SettingsPage  from '../../components/admin/SettingsPage'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-dm-black text-dm-white">
      <AdminSidebar />
      <main className="dm-admin-content">
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products"  element={<ProductsPage  />} />
          <Route path="orders"    element={<OrdersPage    />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
          <Route path="estoque"   element={<EstoquePage   />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="settings"  element={<SettingsPage  />} />
          <Route path="*"         element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
