'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Clock, Users, Flame, ChefHat, ShoppingBasket, ArrowLeft, Check } from 'lucide-react'
import type { Recipe } from '@/types'
import { useCocina } from '@/hooks/useCocina'

const difficultyLabel: Record<string, string> = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' }
const difficultyColor: Record<string, string> = {
  facil: 'bg-fresh-100 text-fresh-700',
  media: 'bg-lemon-100 text-lemon-600',
  dificil: 'bg-red-100 text-red-600',
}

// Group ingredients by section
function groupIngredients(ingredients: Recipe['ingredients']) {
  return ingredients.reduce((acc, ing) => {
    const section = ing.section ?? 'Otros'
    if (!acc[section]) acc[section] = []
    acc[section].push(ing)
    return acc
  }, {} as Record<string, typeof ingredients>)
}

export default function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const { addRecipe, removeRecipe, isInCocina } = useCocina()
  const inCocina = isInCocina(recipe.id)
  const [added, setAdded] = useState(false)

  const grouped = groupIngredients(recipe.ingredients ?? [])
  const totalTime = recipe.prep_time + recipe.cook_time

  function handleCocina() {
    if (inCocina) {
      removeRecipe(recipe.id)
    } else {
      addRecipe(recipe)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className="container-app py-8 max-w-5xl">

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-earth-700 hover:text-fresh-600 transition-colors mb-6">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ── Left col ── */}
        <div className="lg:col-span-3">

          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-fresh-50 mb-6">
            {recipe.image_url ? (
              <Image src={recipe.image_url} alt={recipe.title_es} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {recipe.category?.icon ?? '🍽️'}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="mb-6">
            {recipe.category && (
              <span className="text-xs font-semibold text-fresh-600 uppercase tracking-wide mb-2 block">
                {recipe.category.icon} {recipe.category.name_es}
              </span>
            )}
            <h1 className="font-display font-bold text-3xl text-earth-900 mb-3">{recipe.title_es}</h1>
            {recipe.description_es && (
              <p className="text-earth-700 text-base leading-relaxed">{recipe.description_es}</p>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 py-4 border-y border-earth-100 mb-8">
            <div className="flex items-center gap-2 text-sm text-earth-700">
              <Clock size={16} className="text-fresh-500" />
              <span><strong className="text-earth-900">{totalTime}</strong> min totales</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-earth-700">
              <span className="text-earth-700">Prep: <strong className="text-earth-900">{recipe.prep_time}</strong> · Cocción: <strong className="text-earth-900">{recipe.cook_time}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-earth-700">
              <Users size={16} className="text-fresh-500" />
              <span><strong className="text-earth-900">{recipe.servings}</strong> porciones</span>
            </div>
            {recipe.calories && (
              <div className="flex items-center gap-2 text-sm text-earth-700">
                <Flame size={16} className="text-fresh-500" />
                <span><strong className="text-earth-900">{recipe.calories}</strong> kcal</span>
              </div>
            )}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[recipe.difficulty]}`}>
              {difficultyLabel[recipe.difficulty]}
            </span>
          </div>

          {/* Steps */}
          <section className="mb-8">
            <h2 className="font-display font-bold text-xl text-earth-900 mb-5">Paso a paso</h2>
            <ol className="flex flex-col gap-5">
              {(recipe.steps ?? []).map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="w-8 h-8 bg-fresh-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {step.step}
                  </span>
                  <p className="text-earth-700 leading-relaxed pt-1">{step.text_es}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Tips */}
          {recipe.tips_es && (
            <section className="bg-lemon-50 border border-lemon-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat size={18} className="text-lemon-600" />
                <h3 className="font-semibold text-earth-900 text-sm">Consejo del chef</h3>
              </div>
              <p className="text-earth-700 text-sm leading-relaxed">{recipe.tips_es}</p>
            </section>
          )}
        </div>

        {/* ── Right col: ingredients + cocina ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">

            {/* Add to Cocina button */}
            <button
              onClick={handleCocina}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-btn font-semibold text-sm transition-all mb-6 ${
                inCocina
                  ? 'bg-earth-100 text-earth-700 hover:bg-red-50 hover:text-red-600'
                  : added
                  ? 'bg-fresh-500 text-white'
                  : 'bg-fresh-500 hover:bg-fresh-600 text-white'
              }`}
            >
              {inCocina ? (
                <><Check size={16} /> En tu Cocina · Quitar</>
              ) : added ? (
                <><Check size={16} /> ¡Agregada!</>
              ) : (
                <><ShoppingBasket size={16} /> Agregar a mi Cocina</>
              )}
            </button>

            {/* Ingredients */}
            <div className="bg-white border border-earth-200 rounded-2xl p-5">
              <h2 className="font-display font-bold text-lg text-earth-900 mb-4">
                Ingredientes · {recipe.servings} porciones
              </h2>
              <div className="flex flex-col gap-5">
                {Object.entries(grouped).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="text-xs font-semibold text-fresh-600 uppercase tracking-wide mb-2">{section}</h3>
                    <ul className="flex flex-col gap-1.5">
                      {items.map((ing, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <span className="text-earth-900">{ing.name_es}</span>
                          <span className="text-earth-700 font-medium text-right ml-2">
                            {ing.amount} {ing.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition panel */}
            {recipe.calories && (
              <div className="bg-earth-900 text-white rounded-2xl p-5 mt-4">
                <h3 className="font-display font-bold text-sm mb-1">Información nutricional</h3>
                <p className="text-earth-400 text-xs mb-4">Por porción · {recipe.servings} porciones</p>

                {/* Calories hero */}
                <div className="flex items-end justify-between border-b border-earth-700 pb-3 mb-3">
                  <span className="text-earth-400 text-sm">Calorías</span>
                  <span className="text-3xl font-bold text-white">{recipe.calories}
                    <span className="text-sm font-normal text-earth-400 ml-1">kcal</span>
                  </span>
                </div>

                {/* Macros */}
                <div className="flex flex-col gap-2.5">
                  {recipe.protein != null && (
                    <NutritionRow label="Proteínas" value={recipe.protein} unit="g" color="bg-blue-400" max={50} />
                  )}
                  {recipe.carbs != null && (
                    <NutritionRow label="Carbohidratos" value={recipe.carbs} unit="g" color="bg-lemon-400" max={100} />
                  )}
                  {recipe.fat != null && (
                    <NutritionRow label="Grasas" value={recipe.fat} unit="g" color="bg-orange-400" max={50} />
                  )}
                  {recipe.fiber != null && (
                    <NutritionRow label="Fibra" value={recipe.fiber} unit="g" color="bg-fresh-400" max={30} />
                  )}
                  {recipe.sugar != null && (
                    <NutritionRow label="Azúcares" value={recipe.sugar} unit="g" color="bg-pink-400" max={50} />
                  )}
                  {recipe.sodium != null && (
                    <NutritionRow label="Sodio" value={recipe.sodium} unit="mg" color="bg-purple-400" max={2000} />
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-earth-100 text-earth-700 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NutritionRow({ label, value, unit, color, max }: {
  label: string
  value: number
  unit: string
  color: string
  max: number
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-earth-400">{label}</span>
        <span className="font-semibold text-white">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-earth-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
