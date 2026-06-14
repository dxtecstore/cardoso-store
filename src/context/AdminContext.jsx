import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AdminContext = createContext(null)
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'markoskuiz@gmail.com').toLowerCase()

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  async function verifyAdmin(userSession) {
    if (!userSession) {
      setSession(null)
      setIsAdmin(false)
      return false
    }

    const { data, error } = await supabase.rpc('is_admin')
    const ok = (!error && data === true)
      || (error && userSession.user?.email?.toLowerCase() === ADMIN_EMAIL)

    setSession(userSession)
    setIsAdmin(ok)

    if (!ok) {
      await supabase.auth.signOut()
    }

    return ok
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      await verifyAdmin(data.session)
      if (active) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      verifyAdmin(nextSession).finally(() => {
        if (active) setLoading(false)
      })
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { ok: false, error: 'Credenciais invalidas' }
    }

    const ok = await verifyAdmin(data.session)
    return ok
      ? { ok: true }
      : { ok: false, error: 'Usuario sem permissao administrativa' }
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, session, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
