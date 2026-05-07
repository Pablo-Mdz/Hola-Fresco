'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Recipe } from '@/types'

const STORAGE_KEY = 'hola-fresco-cocina'

// A stored recipe keeps the original amounts but tracks a custom serving count
export type CocinaEntry = Recipe & { _scaledServings?: number }

type MergedIngredient = {
  name_es: string
  name_en: string
  amount: number
  unit: string
  unit_en: string
  section: string
  recipes: string[]
}

function saveToStorage(recipes: CocinaEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  } catch {}
}

function loadFromStorage(): CocinaEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/** Returns a version of the recipe with ingredient amounts pre-scaled to scaledServings */
export function applyServings(entry: CocinaEntry): Recipe {
  const scaled = entry._scaledServings ?? entry.servings
  if (scaled === entry.servings) return entry
  const ratio = scaled / entry.servings
  return {
    ...entry,
    servings: scaled,
    ingredients: (entry.ingredients ?? []).map(ing => {
      const num = parseFloat(ing.amount)
      if (isNaN(num)) return ing
      const result = num * ratio
      const formatted = Number.isInteger(result)
        ? String(result)
        : parseFloat(result.toFixed(1)).toString()
      return { ...ing, amount: formatted }
    }),
  }
}

export function useCocina() {
  const [recipes, setRecipes] = useState<CocinaEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    setRecipes(loadFromStorage())
    setHydrated(true)
  }, [])

  // Add recipe; optionally override servings at time of adding
  const addRecipe = useCallback((recipe: Recipe, servings?: number) => {
    setRecipes(prev => {
      if (prev.some(r => r.id === recipe.id)) return prev
      const entry: CocinaEntry = servings && servings !== recipe.servings
        ? { ...recipe, _scaledServings: servings }
        : recipe
      const next = [...prev, entry]
      saveToStorage(next)
      return next
    })
  }, [])

  const removeRecipe = useCallback((id: string) => {
    setRecipes(prev => {
      const next = prev.filter(r => r.id !== id)
      saveToStorage(next)
      return next
    })
  }, [])

  // Update the serving count of a recipe already in the cocina
  const updateServings = useCallback((id: string, servings: number) => {
    setRecipes(prev => {
      const next = prev.map(r =>
        r.id === id ? { ...r, _scaledServings: Math.max(1, servings) } : r
      )
      saveToStorage(next)
      return next
    })
  }, [])

  const clearCocina = useCallback(() => {
    saveToStorage([])
    setRecipes([])
  }, [])

  const isInCocina = useCallback((id: string) => {
    return recipes.some(r => r.id === id)
  }, [recipes])

  // Merge all ingredients, respecting each recipe's scaled servings
  const mergedIngredients = useCallback((): Record<string, MergedIngredient[]> => {
    const map = new Map<string, MergedIngredient>()

    recipes.forEach(entry => {
      const scaled = entry._scaledServings ?? entry.servings
      const ratio = scaled / entry.servings

      ;(entry.ingredients ?? []).forEach(ing => {
        const key = `${ing.name_es.toLowerCase()}__${ing.unit.toLowerCase()}`
        const num = (parseFloat(ing.amount) || 0) * ratio

        if (map.has(key)) {
          const existing = map.get(key)!
          existing.amount += num
          if (!existing.recipes.includes(entry.title_es)) {
            existing.recipes.push(entry.title_es)
          }
        } else {
          map.set(key, {
            name_es: ing.name_es,
            name_en: ing.name_en ?? ing.name_es,
            amount: num,
            unit: ing.unit,
            unit_en: ing.unit_en ?? ing.unit,
            section: ing.section ?? 'Otros',
            recipes: [entry.title_es],
          })
        }
      })
    })

    const grouped: Record<string, MergedIngredient[]> = {}
    map.forEach(item => {
      if (!grouped[item.section]) grouped[item.section] = []
      grouped[item.section].push(item)
    })

    return grouped
  }, [recipes])

  return { recipes, hydrated, addRecipe, removeRecipe, updateServings, clearCocina, isInCocina, mergedIngredients }
}
