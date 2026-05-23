'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time] = useState(() => new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember }),
      })

      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Usuario o contraseña incorrectos')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div className="admin-page">
        {/* LEFT */}
        <div className="admin-left">
          <Link href="/" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver al sitio
          </Link>

          <Image src="/logo.png" alt="CORPOSEPI" width={120} height={120}
            className="admin-brand-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />

          <div className="admin-brand-name">CORPOSEPI</div>
          <div className="admin-brand-sub">Panel de Administración</div>

          <div className="live-indicator">
            <div className="live-dot" />
            <span>TRANSMISIÓN ACTIVA</span>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Cobertura</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">HD</div>
              <div className="stat-label">Calidad</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{time}</div>
              <div className="stat-label">Hora actual</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔴</div>
              <div className="stat-label">En vivo</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="admin-right">
          <div className="login-header">
            <h2>Acceso al Panel</h2>
            <p>Ingresa tus credenciales de administrador</p>
          </div>

          <div className="login-card">
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  type="text" className="form-input"
                  placeholder="Usuario admin" autoComplete="username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password" className="form-input"
                  placeholder="••••••••" autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="remember-label">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Recordarme 8 horas
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>

            <div className="divider-row">
              <hr /><span>O accede directamente</span><hr />
            </div>

            <a href={process.env.NEXT_PUBLIC_TIKAST_PANEL || 'http://play14.tikast.com:2199'}
              target="_blank" rel="noopener noreferrer" className="tikast-btn">
              <span>Ir al Panel Tikast</span>
              <span className="tikast-badge">Virtualtronics</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
