'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBasket, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { items } = useCart()

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
              Inicio
            </Link>
            <Link href="/recipes" className={`text-sm transition-colors ${isActive('/recipes')}`}>
              Recetas
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cocina"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-btn bg-fresh-50 hover:bg-fresh-100 text-fresh-700 transition-colors text-sm font-medium"
            >
              <ShoppingBasket size={18} />
              <span className="hidden sm:inline">Cocina</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-lemon-400 text-earth-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
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
              Inicio
            </Link>
            <Link href="/recipes" className="text-sm text-earth-700 hover:text-fresh-600" onClick={() => setMenuOpen(false)}>
              Recetas
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
