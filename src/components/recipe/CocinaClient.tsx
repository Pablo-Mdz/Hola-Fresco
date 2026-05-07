'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBasket, Trash2, Download, ArrowLeft, FileText } from 'lucide-react'
import { useCocina, applyServings } from '@/hooks/useCocina'

const SECTION_ORDER = ['Verduras', 'Frutas', 'Carnes y proteínas', 'Pescados', 'Lácteos', 'Harinas y granos', 'Condimentos', 'Otros']

export default function CocinaClient() {
  const { recipes, hydrated, removeRecipe, updateServings, clearCocina, mergedIngredients } = useCocina()
  const [downloading, setDownloading] = useState(false)

  const grouped = mergedIngredients()
  const totalIngredients = Object.values(grouped).flat().length
  const sortedSections = SECTION_ORDER.filter(s => grouped[s]).concat(
    Object.keys(grouped).filter(s => !SECTION_ORDER.includes(s))
  )

  async function downloadPDF(type: 'shopping' | 'recipes') {
    setDownloading(true)
    try {
      // Pre-scale each recipe to its chosen serving count before sending to PDF
      const scaledRecipes = recipes.map(applyServings)
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: scaledRecipes, type }),
      })
      if (!res.ok) throw new Error('Error generando PDF')
      const html = await res.text()
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        // Auto-trigger print dialog
        win.onload = () => win.print()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  // Wait until localStorage is loaded before rendering empty state
  if (!hydrated) {
    return (
      <div className="container-app py-20 text-center">
        <div className="text-4xl mb-4">🥬</div>
        <p className="text-earth-700">Cargando tu Cocina...</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="container-app py-20 text-center max-w-lg mx-auto">
        <div className="text-7xl mb-6">🧺</div>
        <h1 className="font-display font-bold text-3xl text-earth-900 mb-3">Tu Cocina está vacía</h1>
        <p className="text-earth-700 mb-8 leading-relaxed">
          Explorá las recetas y agregá las que más te gusten para armar tu lista de compras.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-fresh-500 hover:bg-fresh-600 text-white font-semibold rounded-btn transition-colors"
        >
          <ArrowLeft size={16} />
          Ver recetas
        </Link>
      </div>
    )
  }

  return (
    <div className="container-app py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBasket className="text-fresh-500" size={24} />
            <h1 className="font-display font-bold text-2xl text-earth-900">Mi Cocina</h1>
          </div>
          <p className="text-earth-700 text-sm">
            {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'} · {totalIngredients} ingredientes
          </p>
        </div>
        <button
          onClick={() => { if (confirm('¿Vaciar tu Cocina?')) clearCocina() }}
          className="text-sm text-earth-700 hover:text-red-600 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={14} />
          Vaciar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Shopping list ── */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-earth-200 rounded-2xl p-6 mb-4">
            <h2 className="font-display font-bold text-lg text-earth-900 mb-5">Lista de compras</h2>

            {sortedSections.map(section => (
              <div key={section} className="mb-5 last:mb-0">
                <h3 className="text-xs font-semibold text-fresh-600 uppercase tracking-wide mb-2">{section}</h3>
                <ul className="flex flex-col gap-2">
                  {grouped[section].map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm border-b border-earth-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-earth-900 font-medium">{item.name_es}</span>
                        {item.recipes.length > 1 && (
                          <span className="text-earth-700 text-xs ml-2">({item.recipes.length} recetas)</span>
                        )}
                      </div>
                      <span className="text-earth-700 font-semibold text-right ml-4">
                        {Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1)} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Download buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => downloadPDF('shopping')}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-fresh-500 hover:bg-fresh-600 disabled:bg-fresh-300 text-white text-sm font-semibold rounded-btn transition-colors"
            >
              <Download size={16} />
              {downloading ? 'Generando...' : 'Descargar lista de compras'}
            </button>
            <button
              onClick={() => downloadPDF('recipes')}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-earth-100 hover:bg-earth-200 disabled:opacity-50 text-earth-700 text-sm font-semibold rounded-btn transition-colors"
            >
              <FileText size={16} />
              Descargar recetas
            </button>
          </div>
        </div>

        {/* ── Recipes in cocina ── */}
        <div className="lg:col-span-2">
          <h2 className="font-display font-bold text-lg text-earth-900 mb-4">Recetas seleccionadas</h2>
          <div className="flex flex-col gap-3">
            {recipes.map(recipe => {
              const displayServings = recipe._scaledServings ?? recipe.servings
              return (
                <div key={recipe.id} className="bg-white border border-earth-200 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-fresh-50 flex-shrink-0">
                      {recipe.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={recipe.image_url} alt={recipe.title_es} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {recipe.category?.icon ?? '🍽️'}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-earth-900 text-sm truncate">{recipe.title_es}</p>
                      <p className="text-earth-500 text-xs mt-0.5">{recipe.prep_time + recipe.cook_time} min</p>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => removeRecipe(recipe.id)}
                      className="p-1.5 text-earth-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Servings scaler */}
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-earth-100">
                    <span className="text-xs text-earth-500">Porciones</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateServings(recipe.id, displayServings - 1)}
                        className="w-6 h-6 rounded-full border border-earth-200 flex items-center justify-center text-earth-600 hover:border-fresh-400 hover:text-fresh-600 hover:bg-fresh-50 transition-colors text-base leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-earth-900 w-16 text-center">
                        {displayServings} {displayServings === 1 ? 'porción' : 'porciones'}
                      </span>
                      <button
                        onClick={() => updateServings(recipe.id, displayServings + 1)}
                        className="w-6 h-6 rounded-full border border-earth-200 flex items-center justify-center text-earth-600 hover:border-fresh-400 hover:text-fresh-600 hover:bg-fresh-50 transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 border border-earth-200 hover:border-fresh-400 text-earth-700 hover:text-fresh-600 text-sm font-medium rounded-btn transition-colors"
          >
            + Agregar más recetas
          </Link>
        </div>
      </div>
    </div>
  )
}
