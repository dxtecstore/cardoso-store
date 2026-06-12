import { createContext, useContext, useState } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem('dm_admin') === '1'
  )

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'caio2026'

  function login(password) {
    const ok = password === ADMIN_PASSWORD
    if (ok) { sessionStorage.setItem('dm_admin', '1'); setIsAdmin(true) }
    return ok
  }

  function logout() {
    sessionStorage.removeItem('dm_admin')
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
