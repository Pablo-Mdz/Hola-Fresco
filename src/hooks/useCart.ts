'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CartRecipe } from '@/types'

const STORAGE_KEY = 'hola-fresco-cocina'

export function useCart() {
  const [items, setItems] = useState<CartRecipe[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  const persist = (next: CartRecipe[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const addRecipe = useCallback((recipe: CartRecipe) => {
    setItems(prev => {
      if (prev.find(r => r.id === recipe.id)) return prev
      const next = [...prev, recipe]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeRecipe = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    persist([])
  }, [])

  const hasRecipe = useCallback(
    (id: string) => items.some(r => r.id === id),
    [items]
  )

  return { items, addRecipe, removeRecipe, clearCart, hasRecipe, hydrated }
}
