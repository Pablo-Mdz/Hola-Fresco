'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Leaf, BookOpen, LogOut, ChefHat } from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin/recipes', label: 'Recetas', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-earth-200 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-earth-100">
          <Link href="/" className="flex items-center gap-2 group">
            <Leaf className="text-fresh-500" size={20} />
            <span className="font-display font-bold text-fresh-700 text-base">Hola Fresco</span>
          </Link>
          <p className="text-xs text-earth-700 mt-0.5 ml-7">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-fresh-50 text-fresh-700'
                  : 'text-earth-700 hover:bg-earth-100 hover:text-earth-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-earth-100">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-earth-700 hover:bg-earth-100 transition-colors mb-1"
          >
            <ChefHat size={16} />
            Ver sitio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-earth-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
