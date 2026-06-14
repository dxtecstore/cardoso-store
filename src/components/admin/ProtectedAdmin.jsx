import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

export default function ProtectedAdmin({ children }) {
  const { isAdmin, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-dm-black flex items-center justify-center text-dm-muted">
        Carregando...
      </div>
    )
  }

  return isAdmin ? children : <Navigate to="/admin" replace />
}
