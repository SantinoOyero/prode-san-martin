import type { Metadata, Viewport } from 'next'
import { Anton, Archivo } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prode Mundial 2026 · Club San Martín',
  description:
    'Prode oficial del Club San Martín para el Mundial 2026. Predecí los resultados, sumá puntos y bancá la gira del club.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Prode San Martín',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#073d17',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${archivo.variable} ${anton.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
