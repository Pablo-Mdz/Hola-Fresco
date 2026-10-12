'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Category, Recipe } from '@/types'
import RecipeCard from './RecipeCard'
import { useLang, pick } from '@/contexts/LangContext'
import { t, tr } from '@/lib/translations'

interface RecipesClientProps {
  categories: Category[]
  recipes: Recipe[]
}

export default function RecipesClient({ categories, recipes }: RecipesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const { lang } = useLang()

  const DIFFICULTY_OPTIONS = [
    { value: '',        label: tr(t.recipes.allDifficulties, lang) },
    { value: 'facil',   label: tr(t.recipes.easy,   lang) },
    { value: 'media',   label: tr(t.recipes.medium, lang) },
    { value: 'dificil', label: tr(t.recipes.hard,   lang) },
  ]

  const SORT_OPTIONS = [
    { value: 'newest',      label: tr(t.recipes.newest,    lang) },
    { value: 'time_asc',    label: tr(t.recipes.fastest,   lang) },
    { value: 'calories_asc',label: tr(t.recipes.lowestCal, lang) },
  ]

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

  const recipeCount = (n: number) =>
    `${n} ${n === 1 ? tr(t.recipes.recipe, lang) : tr(t.recipes.recipes, lang)}`

  const resultCount = (n: number) =>
    `${n} ${n === 1 ? tr(t.recipes.result, lang) : tr(t.recipes.results, lang)}`

  return (
    <div className="container-app py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">
          {tr(t.recipes.pageTitle, lang)}
        </h1>
        <p className="text-earth-700">
          {recipeCount(recipes.length)} {tr(t.recipes.available, lang)}
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-700" size={18} />
          <input
            type="text"
            placeholder={tr(t.recipes.searchPlaceholder, lang)}
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
          {tr(t.recipes.filters, lang)}
          {difficulty && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>
      </div>

      {/* Extra filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-earth-50 rounded-card border border-earth-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-earth-700 uppercase tracking-wide">
              {tr(t.recipes.difficulty, lang)}
            </label>
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
            <label className="text-xs font-semibold text-earth-700 uppercase tracking-wide">
              {tr(t.recipes.sortBy, lang)}
            </label>
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
          {difficulty && (
            <div className="flex items-end">
              <button
                onClick={() => setDifficulty('')}
                className="px-3 py-2 text-sm text-earth-700 hover:text-earth-900 underline"
              >
                {tr(t.recipes.clearFilters, lang)}
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
          {tr(t.recipes.allCategory, lang)} <span className="opacity-70">({recipes.length})</span>
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
              {pick(cat.name_es, cat.name_en, lang)}
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Results count when filtering */}
      {(activeCategory || search || difficulty) && (
        <p className="text-sm text-earth-700 mb-4">
          {resultCount(filtered.length)}
          {search && <span> {tr(t.recipes.for, lang)} <strong>"{search}"</strong></span>}
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
            {tr(t.recipes.noResultsTitle, lang)}
          </h2>
          <p className="text-earth-700 max-w-sm mx-auto mb-4">
            {tr(t.recipes.noResultsSubtitle, lang)}
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory(null); setDifficulty('') }}
            className="px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-semibold rounded-btn transition-colors"
          >
            {tr(t.recipes.seeAll, lang)}
          </button>
        </div>
      )}
    </div>
  )
}
