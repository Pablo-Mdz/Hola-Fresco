'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, ShoppingBasket } from 'lucide-react'
import type { Category, Recipe } from '@/types'
import RecipeCard from './RecipeCard'

interface HomeClientProps {
  categories: Category[]
  recipes: Recipe[]
}

export default function HomeClient({ categories, recipes }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Count recipes per category
  const countByCategory = recipes.reduce<Record<string, number>>((acc, r) => {
    if (r.category_id) acc[r.category_id] = (acc[r.category_id] ?? 0) + 1
    return acc
  }, {})

  const filtered = recipes.filter(r => {
    const matchCat = !activeCategory || r.category_id === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.title_es.toLowerCase().includes(q) ||
      r.title_en.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-fresh-50 via-white to-lemon-50 border-b border-fresh-100">
        <div className="container-app py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-fresh-600 font-semibold text-sm tracking-wide uppercase mb-3">
              🥬 Hola Fresco
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-earth-900 leading-tight mb-4">
              Cocina rico,{' '}
              <span className="text-fresh-500 italic">sin complicarte.</span>
            </h1>
            <p className="text-earth-700 text-lg md:text-xl mb-8 leading-relaxed">
              Recetas fáciles y saludables con lista de compras descargable.
              Elegís las recetas, nosotros te decimos qué comprar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-fresh-500 hover:bg-fresh-600 text-white font-semibold rounded-btn transition-colors shadow-sm"
              >
                Ver recetas
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/cocina"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lemon-400 hover:bg-lemon-500 text-earth-900 font-semibold rounded-btn transition-colors"
              >
                <ShoppingBasket size={18} />
                Mi Cocina
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories + Search ── */}
      <section className="container-app py-10">
        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-700" size={18} />
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-earth-200 rounded-btn bg-white text-earth-900 placeholder:text-earth-700 focus:outline-none focus:ring-2 focus:ring-fresh-400 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              !activeCategory
                ? 'bg-fresh-500 text-white border-fresh-500 shadow-sm'
                : 'bg-white text-earth-700 border-earth-200 hover:border-fresh-400 hover:text-fresh-600'
            }`}
          >
            Todas <span className="opacity-70">({recipes.length})</span>
          </button>
          {categories.map(cat => {
            const count = countByCategory[cat.id] ?? 0
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'text-white border-transparent shadow-sm'
                    : count === 0
                      ? 'bg-white text-earth-400 border-earth-100 cursor-not-allowed'
                      : 'bg-white text-earth-700 border-earth-200 hover:border-fresh-400 hover:text-fresh-600'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                disabled={count === 0}
              >
                <span>{cat.icon}</span>
                {cat.name_es}
                {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Recipe grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="font-display text-2xl font-semibold text-earth-900 mb-2">
              Las recetas están en camino
            </h2>
            <p className="text-earth-700 max-w-sm mx-auto">
              Pronto vas a encontrar aquí recetas deliciosas y saludables para cocinar en casa.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
