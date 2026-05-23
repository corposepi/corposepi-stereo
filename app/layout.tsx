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
      </head>
      <body>{children}</body>
    </html>
  )
}
