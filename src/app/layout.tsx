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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001')

const defaultOgImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=630&fit=crop&auto=format'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Hola Fresco — Recetas fáciles y saludables',
    template: '%s | Hola Fresco',
  },
  description: 'Recetas fáciles y saludables con lista de compras descargable. Elegís las recetas, nosotros te decimos qué comprar.',
  keywords: ['recetas', 'saludable', 'fácil', 'lista de compras', 'cocina casera', 'meal planning'],
  openGraph: {
    siteName: 'Hola Fresco',
    title: 'Hola Fresco — Recetas fáciles y saludables',
    description: 'Recetas fáciles y saludables con lista de compras descargable. Elegís las recetas y nosotros te decimos qué comprar.',
    type: 'website',
    locale: 'es_AR',
    url: baseUrl,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Hola Fresco — Recetas fáciles y saludables' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hola Fresco — Recetas fáciles y saludables',
    description: 'Recetas fáciles y saludables con lista de compras descargable.',
    images: [defaultOgImage],
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
