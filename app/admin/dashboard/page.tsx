'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Program, ProgramInput } from '@/types'

const DAYS_OPTIONS = [
  { value: 'all', label: 'Todos los días' },
  { value: 'weekdays', label: 'Lunes a Viernes' },
  { value: 'weekends', label: 'Sábado y Domingo' },
]

const EMPTY_FORM: ProgramInput = {
  title: '', host: '', description: '',
  start_time: '06:00', end_time: '08:00',
  days: 'all', is_active: true, order_num: 0,
}

type Toast = { msg: string; type: 'success' | 'error' }
type ModalMode = 'add' | 'edit'

export default function DashboardPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProgramInput>(EMPTY_FORM)

  // Confirm delete
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmTitle, setConfirmTitle] = useState('')

  // Toast
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (msg: string, type: Toast['type'] = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/programs')
    if (res.ok) {
      const data = await res.json()
      setPrograms(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  // ── OPEN ADD MODAL ──
  function openAdd() {
    setForm({ ...EMPTY_FORM, order_num: programs.length })
    setModalMode('add')
    setEditingId(null)
    setModalOpen(true)
  }

  // ── OPEN EDIT MODAL ──
  function openEdit(prog: Program) {
    setForm({
      title: prog.title, host: prog.host, description: prog.description,
      start_time: prog.start_time, end_time: prog.end_time,
      days: prog.days, is_active: prog.is_active, order_num: prog.order_num,
    })
    setModalMode('edit')
    setEditingId(prog.id)
    setModalOpen(true)
  }

  // ── SAVE (add or edit) ──
  async function handleSave() {
    if (!form.title.trim()) { showToast('El título es obligatorio', 'error'); return }
    setSaving(true)
    try {
      const isEdit = modalMode === 'edit' && editingId
      const url = isEdit ? `/api/programs/${editingId}` : '/api/programs'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToast(isEdit ? '✓ Programa actualizado' : '✓ Programa agregado')
        setModalOpen(false)
        fetchPrograms()
      } else {
        const d = await res.json()
        showToast(d.error || 'Error al guardar', 'error')
      }
    } catch {
      showToast('Error de red', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── TOGGLE ACTIVE ──
  async function toggleActive(prog: Program) {
    const res = await fetch(`/api/programs/${prog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prog, is_active: !prog.is_active }),
    })
    if (res.ok) {
      showToast(prog.is_active ? 'Programa desactivado' : 'Programa activado')
      fetchPrograms()
    }
  }

  // ── DELETE ──
  async function confirmDelete() {
    if (!confirmId) return
    const res = await fetch(`/api/programs/${confirmId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('✓ Programa eliminado')
      fetchPrograms()
    } else {
      showToast('Error al eliminar', 'error')
    }
    setConfirmId(null)
  }

  // ── LOGOUT ──
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  const activeCount = programs.filter(p => p.is_active).length
  const currentHour = new Date().getHours()
  const currentProg = programs.find(p => {
    const sh = parseInt(p.start_time); const eh = parseInt(p.end_time)
    return p.is_active && currentHour >= sh && currentHour < eh
  })

  return (
    <>
      <div className="bg-orbs" style={{ opacity: 0.5 }}>
        <div className="orb orb-1" /><div className="orb orb-2" />
      </div>

      <div className="dash-page">
        {/* TOPBAR */}
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <Image src="/logo.png" alt="CORPOSEPI" width={36} height={36}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <div className="dash-topbar-title">CORPOSEPI STEREO</div>
              <div className="dash-topbar-sub">Panel de Administración</div>
            </div>
          </div>
          <div className="dash-topbar-right">
            <Link href="/" className="dash-ext-btn" target="_blank">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Ver sitio
            </Link>
            <a href={process.env.NEXT_PUBLIC_TIKAST_PANEL || 'http://play14.tikast.com:2199'}
              target="_blank" rel="noopener" className="dash-ext-btn">
              🎛️ Tikast
            </a>
            <button className="dash-logout-btn" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>

        {/* BODY */}
        <div className="dash-body">
          {/* STATS */}
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-val">{programs.length}</div>
              <div className="dash-stat-label">Programas totales</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val" style={{ color: '#4ade80' }}>{activeCount}</div>
              <div className="dash-stat-label">Activos</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val" style={{ color: '#fb923c' }}>{programs.length - activeCount}</div>
              <div className="dash-stat-label">Inactivos</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val" style={{ fontSize: 16, paddingTop: 4 }}>
                {currentProg ? currentProg.title : '—'}
              </div>
              <div className="dash-stat-label">Al aire ahora</div>
            </div>
          </div>

          {/* PROGRAMS HEADER */}
          <div className="programs-header">
            <h2>Parrilla de Programación</h2>
            <button className="add-btn" onClick={openAdd}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Agregar Programa
            </button>
          </div>

          {/* PROGRAMS LIST */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" /></div>
          ) : programs.length === 0 ? (
            <div className="programs-empty">
              <p>No hay programas aún.</p>
              <small>Haz clic en "Agregar Programa" para comenzar.</small>
            </div>
          ) : (
            <div className="programs-list">
              {programs.map(prog => (
                <div key={prog.id} className={`program-item ${prog.is_active ? '' : 'inactive'}`}>
                  <div className="prog-time">
                    {prog.start_time} – {prog.end_time}
                    <span className="prog-days-badge">{DAYS_OPTIONS.find(d => d.value === prog.days)?.label ?? prog.days}</span>
                  </div>
                  <div className="prog-info">
                    <div className="prog-title">{prog.title}</div>
                    {prog.host && <div className="prog-host">👤 {prog.host}</div>}
                    {prog.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {prog.description.length > 80 ? prog.description.slice(0, 80) + '…' : prog.description}
                      </div>
                    )}
                  </div>
                  <div className="prog-actions">
                    <button
                      className={`prog-toggle ${prog.is_active ? 'on' : 'off'}`}
                      onClick={() => toggleActive(prog)}
                    >
                      {prog.is_active ? '● ACTIVO' : '○ INACTIVO'}
                    </button>
                    <button className="prog-edit" onClick={() => openEdit(prog)} title="Editar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="prog-delete"
                      onClick={() => { setConfirmId(prog.id); setConfirmTitle(prog.title) }}
                      title="Eliminar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <div className="modal-title">{modalMode === 'add' ? 'Nuevo Programa' : 'Editar Programa'}</div>
            <div className="modal-sub">{modalMode === 'add' ? 'Completa los datos del nuevo programa' : 'Modifica los datos del programa'}</div>

            <div className="modal-grid">
              {/* Título */}
              <div className="form-group full">
                <label className="form-label">Título del Programa *</label>
                <input type="text" className="form-input" placeholder="Ej: Buenos Días CORPOSEPI"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Conductor */}
              <div className="form-group full">
                <label className="form-label">Conductor / Host</label>
                <input type="text" className="form-input" placeholder="Ej: Lic. María González"
                  value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
              </div>

              {/* Descripción */}
              <div className="form-group full">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows={3}
                  placeholder="Breve descripción del programa..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Hora inicio */}
              <div className="form-group">
                <label className="form-label">Hora de inicio</label>
                <input type="time" className="form-input"
                  value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>

              {/* Hora fin */}
              <div className="form-group">
                <label className="form-label">Hora de fin</label>
                <input type="time" className="form-input"
                  value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>

              {/* Días */}
              <div className="form-group">
                <label className="form-label">Días de transmisión</label>
                <select className="form-input"
                  value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))}>
                  {DAYS_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* Orden */}
              <div className="form-group">
                <label className="form-label">Orden en pantalla</label>
                <input type="number" className="form-input" min={0} max={99}
                  value={form.order_num} onChange={e => setForm(f => ({ ...f, order_num: Number(e.target.value) }))} />
              </div>

              {/* Activo */}
              <div className="form-group full">
                <label className="remember-label" style={{ gap: 12 }}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                  <span style={{ fontSize: 13 }}>Mostrar en la página de oyentes</span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="modal-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : modalMode === 'add' ? 'Agregar Programa' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmId && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmId(null) }}>
          <div className="confirm-box">
            <div className="confirm-icon">🗑️</div>
            <div className="confirm-title">¿Eliminar programa?</div>
            <div className="confirm-text">
              Vas a eliminar <strong>"{confirmTitle}"</strong>. Esta acción no se puede deshacer y dejará de aparecer en la programación.
            </div>
            <div className="confirm-actions">
              <button className="confirm-no" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="confirm-yes" onClick={confirmDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}
    </>
  )
}
