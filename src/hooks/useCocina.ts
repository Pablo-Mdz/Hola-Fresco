'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Recipe } from '@/types'

const STORAGE_KEY = 'hola-fresco-cocina'

type MergedIngredient = {
  name_es: string
  name_en: string
  amount: number
  unit: string
  unit_en: string
  section: string
  recipes: string[]
}

function saveToStorage(recipes: Recipe[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  } catch {}
}

function loadFromStorage(): Recipe[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function useCocina() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    setRecipes(loadFromStorage())
    setHydrated(true)
  }, [])

  // Save immediately in each mutation — no dependency on useEffect timing
  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      if (prev.some(r => r.id === recipe.id)) return prev
      const next = [...prev, recipe]
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

  const clearCocina = useCallback(() => {
    saveToStorage([])
    setRecipes([])
  }, [])

  const isInCocina = useCallback((id: string) => {
    return recipes.some(r => r.id === id)
  }, [recipes])

  // Merge all ingredients across recipes, summing same ingredient+unit combos
  const mergedIngredients = useCallback((): Record<string, MergedIngredient[]> => {
    const map = new Map<string, MergedIngredient>()

    recipes.forEach(recipe => {
      (recipe.ingredients ?? []).forEach(ing => {
        const key = `${ing.name_es.toLowerCase()}__${ing.unit.toLowerCase()}`
        const num = parseFloat(ing.amount) || 0

        if (map.has(key)) {
          const existing = map.get(key)!
          existing.amount += num
          if (!existing.recipes.includes(recipe.title_es)) {
            existing.recipes.push(recipe.title_es)
          }
        } else {
          map.set(key, {
            name_es: ing.name_es,
            name_en: ing.name_en ?? ing.name_es,
            amount: num,
            unit: ing.unit,
            unit_en: ing.unit_en ?? ing.unit,
            section: ing.section ?? 'Otros',
            recipes: [recipe.title_es],
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

  return { recipes, hydrated, addRecipe, removeRecipe, clearCocina, isInCocina, mergedIngredients }
}
