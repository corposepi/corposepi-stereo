import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CORPOSEPI STEREO',
  description: 'La voz de la educación y el pensamiento innovador — Radio en vivo 24/7',
  keywords: ['radio', 'educación', 'CORPOSEPI', 'streaming', 'en vivo'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CORPOSEPI STEREO',
  },
  openGraph: {
    title: 'CORPOSEPI STEREO',
    description: 'La voz de la educación y el pensamiento innovador',
    type: 'website',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#8B3220',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Raleway:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
        {/* Iconos para iOS (Safari/iPhone) */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Icono estándar */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="shortcut icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
