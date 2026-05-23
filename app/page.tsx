'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Program } from '@/types'

const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://195.154.79.204:8019/stream'
const FALLBACK_URL = 'http://195.154.79.204:8019/'

const DAYS_LABEL: Record<string, string> = {
  all: 'Todos los días',
  weekdays: 'Lun – Vie',
  weekends: 'Sáb – Dom',
}

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showInstall, setShowInstall] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const audioRef = useRef<HTMLAudioElement>(null)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  // Fetch programs + real-time
  const fetchPrograms = useCallback(async () => {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('order_num', { ascending: true })
    if (data) setPrograms(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPrograms()

    const channel = supabase
      .channel('programs-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'programs' }, fetchPrograms)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPrograms])

  // Current hour updater
  useEffect(() => {
    const iv = setInterval(() => setCurrentHour(new Date().getHours()), 60_000)
    return () => clearInterval(iv)
  }, [])

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setTimeout(() => setShowInstall(true), 4000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [programs])

  // Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  function isCurrentProgram(prog: Program): boolean {
    const [sh] = prog.start_time.split(':').map(Number)
    const [eh] = prog.end_time.split(':').map(Number)
    return currentHour >= sh && currentHour < eh
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.src = STREAM_URL
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          audio.src = FALLBACK_URL
          audio.play().then(() => setIsPlaying(true)).catch(() => {})
        })
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'CORPOSEPI STEREO',
          artist: 'Educación · Pensamiento · Innovación',
          album: 'En Vivo',
        })
      }
    }
  }

  function handleVolume(val: number) {
    setVolume(val)
    if (audioRef.current) audioRef.current.volume = val / 100
  }

  async function installApp() {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt()
      deferredPrompt.current = null
    }
    setShowInstall(false)
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'CORPOSEPI STEREO', text: '¡Escucha CORPOSEPI STEREO en vivo!', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('¡Enlace copiado!'))
    }
  }

  return (
    <>
      {/* BG ORBS */}
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a href="#inicio"        onClick={() => setMobileOpen(false)}>Inicio</a>
        <a href="#programacion"  onClick={() => setMobileOpen(false)}>Programación</a>
        <a href="#nosotros"      onClick={() => setMobileOpen(false)}>Nosotros</a>
        <a href="#contacto"      onClick={() => setMobileOpen(false)}>Contacto</a>
        <Link href="/admin" className="mob-admin" onClick={() => setMobileOpen(false)}>Panel Admin</Link>
      </div>

      {/* NAV */}
      <nav className="nav">
        <a href="#inicio" className="nav-logo">
          <Image src="/logo.png" alt="CORPOSEPI" width={38} height={38}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div>
            <div className="nav-logo-station">CORPOSEPI STEREO</div>
            <div className="nav-logo-tag">Educación · Pensamiento · Innovación</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#programacion">Programación</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <Link href="/admin" className="nav-admin">Panel Admin</Link>
        <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="live-badge">
          <div className="live-dot" />
          EN VIVO · 24 HRS
        </div>

        <Image src="/logo.png" alt="CORPOSEPI STEREO" width={140} height={140}
          className="hero-logo"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />

        <h1>CORPOSEPI<br />STEREO</h1>
        <h2>La voz de la educación y el pensamiento innovador</h2>

        {/* PLAYER */}
        <div className="player-card">
          <div className={`visualizer ${isPlaying ? '' : 'paused'}`}>
            {Array.from({ length: 15 }).map((_, i) => <div key={i} className="bar" />)}
          </div>

          <div className="now-playing">
            <div className="np-label">Transmitiendo ahora</div>
            <div className="marquee-wrap">
              <div className={`marquee-inner ${isPlaying ? '' : 'paused'}`}>
                <span className="np-track">♪ &nbsp; CORPOSEPI STEREO — En Vivo &nbsp;·&nbsp; CORPOSEPI STEREO — En Vivo &nbsp;·&nbsp;</span>
              </div>
            </div>
            <div className="np-artist">Educación · Pensamiento · Innovación</div>
          </div>

          <div className="player-controls">
            {/* Mute */}
            <button className="ctrl-btn" onClick={() => handleVolume(0)} title="Silenciar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            </button>
            {/* Play/Pause */}
            <button className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
              {isPlaying ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
            {/* Share */}
            <button className="ctrl-btn" onClick={share} title="Compartir">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div className="volume-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
            <input
              type="range" min="0" max="100" value={volume}
              style={{ '--vol': `${volume}%` } as React.CSSProperties}
              onChange={e => handleVolume(Number(e.target.value))}
            />
          </div>

          <audio ref={audioRef} preload="none" />
        </div>
      </section>

      {/* PROGRAMACIÓN */}
      <section id="programacion">
        <div className="section-label">En pantalla</div>
        <h2 className="section-title">Programación</h2>
        <span className="divider" />

        {loading ? (
          <div className="schedule-loading"><div className="spinner" /></div>
        ) : programs.length === 0 ? (
          <div className="schedule-empty">
            <p>No hay programas configurados aún.</p>
            <small>El administrador puede agregar programas desde el panel.</small>
          </div>
        ) : (
          <div className="schedule-grid">
            {programs.map(prog => (
              <div key={prog.id} className={`schedule-card reveal ${isCurrentProgram(prog) ? 'active' : ''}`}>
                <div className="sc-time">{prog.start_time} – {prog.end_time}</div>
                <div className="sc-title">{prog.title}</div>
                {prog.host && <div className="sc-host">👤 {prog.host}</div>}
                {prog.description && <div className="sc-desc">{prog.description}</div>}
                <span className="sc-days">{DAYS_LABEL[prog.days] ?? prog.days}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NOSOTROS */}
      <section id="nosotros">
        <div className="section-label">Quiénes somos</div>
        <h2 className="section-title">Misión CORPOSEPI</h2>
        <span className="divider" />
        <div className="about-grid">
          {[
            { icon: '🎓', title: 'Educación', text: 'Promovemos el acceso a contenido educativo de calidad para toda la comunidad escolar.' },
            { icon: '💡', title: 'Innovación', text: 'Apostamos por nuevas metodologías y el pensamiento creativo como motor del aprendizaje.' },
            { icon: '🤝', title: 'Comunidad', text: 'Conectamos familias, docentes y estudiantes en un mismo espacio radiofónico.' },
            { icon: '📡', title: 'Alcance 24/7', text: 'Transmitimos las 24 horas del día desde cualquier dispositivo, sin interrupciones.' },
          ].map(item => (
            <div key={item.title} className="about-card reveal">
              <div className="about-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto">
        <div className="section-label">Síguenos</div>
        <h2 className="section-title">Conéctate</h2>
        <span className="divider" />
        <div className="social-row">
          <a href="#" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </a>
          <a href="#" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </a>
          <a href="#" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </section>

      <footer>
        <p>© 2025 <strong>CORPOSEPI STEREO</strong> — Corporación de Servicios Educativos, Pensamiento e Innovación</p>
        <p style={{ marginTop: 8 }}>Transmitiendo con 💛 para la comunidad educativa</p>
      </footer>

      {/* INSTALL BANNER */}
      {showInstall && (
        <div className="install-banner">
          <div className="install-text">
            <strong>Instala la App</strong>
            <span>Escucha CORPOSEPI STEREO sin navegador</span>
          </div>
          <button className="install-do-btn" onClick={installApp}>Instalar</button>
          <button className="install-close" onClick={() => setShowInstall(false)}>✕</button>
        </div>
      )}
    </>
  )
}

// Type for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
}
