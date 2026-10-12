'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBasket, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCocina } from '@/hooks/useCocina'
import { useLang } from '@/contexts/LangContext'
import { t, tr } from '@/lib/translations'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { recipes } = useCocina()
  const { lang, setLang } = useLang()

  const isActive = (href: string) =>
    pathname === href ? 'text-fresh-600 font-semibold' : 'text-earth-700 hover:text-fresh-600'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-fresh-100 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🥬</span>
            <span className="font-display font-bold text-xl text-fresh-700 group-hover:text-fresh-600 transition-colors">
              Hola Fresco
            </span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm transition-colors ${isActive('/')}`}>
              {tr(t.nav.home, lang)}
            </Link>
            <Link href="/recipes" className={`text-sm transition-colors ${isActive('/recipes')}`}>
              {tr(t.nav.recipes, lang)}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* EN/ES toggle */}
            <div className="flex items-center rounded-full border border-earth-200 text-xs font-semibold overflow-hidden">
              <button
                onClick={() => setLang('es')}
                className={`px-2.5 py-1 transition-colors ${
                  lang === 'es'
                    ? 'bg-fresh-500 text-white'
                    : 'text-earth-700 hover:text-fresh-600'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 transition-colors ${
                  lang === 'en'
                    ? 'bg-fresh-500 text-white'
                    : 'text-earth-700 hover:text-fresh-600'
                }`}
              >
                EN
              </button>
            </div>

            {/* Cart */}
            <Link
              href="/cocina"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-btn bg-fresh-50 hover:bg-fresh-100 text-fresh-700 transition-colors text-sm font-medium"
            >
              <ShoppingBasket size={18} />
              <span className="hidden sm:inline">{tr(t.nav.kitchen, lang)}</span>
              {recipes.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-lemon-400 text-earth-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {recipes.length}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-earth-700 hover:text-fresh-600 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-fresh-100 mt-2 pt-4 flex flex-col gap-3">
            <Link href="/" className="text-sm text-earth-700 hover:text-fresh-600" onClick={() => setMenuOpen(false)}>
              {tr(t.nav.home, lang)}
            </Link>
            <Link href="/recipes" className="text-sm text-earth-700 hover:text-fresh-600" onClick={() => setMenuOpen(false)}>
              {tr(t.nav.recipes, lang)}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
