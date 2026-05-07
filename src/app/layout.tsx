import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Hola Fresco — Recetas fáciles y saludables',
  description: 'Recetas fáciles, rápidas y saludables. Descarga la lista de compras y cocina con confianza.',
  keywords: ['recetas', 'saludable', 'fácil', 'lista de compras', 'cocina'],
  openGraph: {
    title: 'Hola Fresco',
    description: 'Recetas fáciles y saludables con lista de compras descargable',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-earth-900 antialiased">
        {children}
      </body>
    </html>
  )
}
