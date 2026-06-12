import { Routes, Route } from 'react-router-dom'
import Home           from './pages/client/Home'
import AdminLogin     from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedAdmin from './components/admin/ProtectedAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<Home />} />
      <Route path="/admin"   element={<AdminLogin />} />
      <Route path="/admin/*" element={
        <ProtectedAdmin>
          <AdminDashboard />
        </ProtectedAdmin>
      } />
    </Routes>
  )
}
