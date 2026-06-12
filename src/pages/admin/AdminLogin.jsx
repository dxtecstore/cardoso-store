import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdmin }    from '../../context/AdminContext'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const { login, isAdmin } = useAdmin()
  const navigate = useNavigate()
  const [pw,    setPw]    = useState('')
  const [show,  setShow]  = useState(false)
  const [error, setError] = useState('')

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    if (login(pw)) {
      navigate('/admin/dashboard')
    } else {
      setError('Senha incorreta')
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-dm-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif text-dm-gold text-2xl tracking-widest uppercase mb-1">
            Cardoso Store
          </p>
          <p className="text-[10px] tracking-[0.35em] uppercase text-dm-muted">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="dm-admin-card space-y-5">
          <div>
            <label className="dm-label">Senha de acesso</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={e => { setPw(e.target.value); setError('') }}
                className="dm-input pr-10"
                placeholder="••••••••"
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dm-muted hover:text-dm-white transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
          </div>

          <button type="submit" className="dm-btn w-full">Entrar</button>
        </form>

        <p className="text-center text-[10px] text-dm-muted mt-6">
          <a href="/" className="hover:text-dm-gold transition-colors">Voltar para a loja</a>
        </p>
      </div>
    </div>
  )
}


