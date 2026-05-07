'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Category, Recipe } from '@/types'
import RecipeCard from './RecipeCard'

interface RecipesClientProps {
  categories: Category[]
  recipes: Recipe[]
}

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Todas las dificultades' },
  { value: 'facil', label: 'Fácil' },
  { value: 'media', label: 'Media' },
  { value: 'dificil', label: 'Difícil' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más nuevas' },
  { value: 'time_asc', label: 'Más rápidas' },
  { value: 'calories_asc', label: 'Menos calorías' },
]

export default function RecipesClient({ categories, recipes }: RecipesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Count recipes per category
  const countByCategory = recipes.reduce<Record<string, number>>((acc, r) => {
    if (r.category_id) acc[r.category_id] = (acc[r.category_id] ?? 0) + 1
    return acc
  }, {})

  // Filter
  let filtered = recipes.filter(r => {
    const matchCat = !activeCategory || r.category_id === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.title_es.toLowerCase().includes(q) ||
      r.title_en.toLowerCase().includes(q) ||
      (r.description_es ?? '').toLowerCase().includes(q)
    const matchDiff = !difficulty || r.difficulty === difficulty
    return matchCat && matchSearch && matchDiff
  })

  // Sort
  if (sort === 'time_asc') {
    filtered = [...filtered].sort((a, b) => (a.prep_time + a.cook_time) - (b.prep_time + b.cook_time))
  } else if (sort === 'calories_asc') {
    filtered = [...filtered].sort((a, b) => (a.calories ?? Infinity) - (b.calories ?? Infinity))
  }
  // 'newest' is already the default order from the server

  return (
    <div className="container-app py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">
          Todas las recetas
        </h1>
        <p className="text-earth-700">
          {recipes.length} receta{recipes.length !== 1 ? 's' : ''} disponibles
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-700" size={18} />
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-earth-200 rounded-btn bg-white text-earth-900 placeholder:text-earth-700 focus:outline-none focus:ring-2 focus:ring-fresh-400 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-btn border text-sm font-medium transition-colors ${
            showFilters || difficulty
              ? 'bg-fresh-500 text-white border-fresh-500'
              : 'bg-white text-earth-700 border-earth-200 hover:border-fresh-400 hover:text-fresh-600'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {difficulty && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>
      </div>

      {/* Extra filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-earth-50 rounded-card border border-earth-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-earth-700 uppercase tracking-wide">Dificultad</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="px-3 py-2 text-sm border border-earth-200 rounded-btn bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-fresh-400"
            >
              {DIFFICULTY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-earth-700 uppercase tracking-wide">Ordenar por</label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 text-sm border border-earth-200 rounded-btn bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-fresh-400"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {(difficulty) && (
            <div className="flex items-end">
              <button
                onClick={() => setDifficulty('')}
                className="px-3 py-2 text-sm text-earth-700 hover:text-earth-900 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Results count when filtering */}
      {(activeCategory || search || difficulty) && (
        <p className="text-sm text-earth-700 mb-4">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && <span> para <strong>"{search}"</strong></span>}
        </p>
      )}

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-semibold text-earth-900 mb-2">
            No encontramos recetas
          </h2>
          <p className="text-earth-700 max-w-sm mx-auto mb-4">
            Probá con otras palabras o eliminá algunos filtros.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory(null); setDifficulty('') }}
            className="px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-semibold rounded-btn transition-colors"
          >
            Ver todas las recetas
          </button>
        </div>
      )}
    </div>
  )
}
