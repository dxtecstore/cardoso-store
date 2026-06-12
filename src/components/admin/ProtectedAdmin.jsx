import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'

export default function ProtectedAdmin({ children }) {
  const { isAdmin } = useAdmin()
  return isAdmin ? children : <Navigate to="/admin" replace />
}
