export type Locale = 'es' | 'en'

export type Difficulty = 'facil' | 'media' | 'dificil'

export type RecipeStatus = 'draft' | 'published'

export interface Category {
  id: string
  slug: string
  name_es: string
  name_en: string
  icon: string
  color: string
  sort_order: number
  created_at: string
}

export interface Ingredient {
  name_es: string
  name_en: string
  amount: string
  unit: string
  unit_en: string
  section?: string   // e.g. "Verduras", "Lácteos" — for grouping in shopping list
}

export interface RecipeStep {
  step: number
  text_es: string
  text_en: string
}

export interface Recipe {
  id: string
  slug: string
  title_es: string
  title_en: string
  description_es: string | null
  description_en: string | null
  category_id: string | null
  image_url: string | null
  prep_time: number
  cook_time: number
  servings: number
  difficulty: Difficulty
  ingredients: Ingredient[]
  steps: RecipeStep[]
  tips_es: string | null
  tips_en: string | null
  calories: number | null
  protein: number | null   // g
  carbs: number | null     // g
  fat: number | null       // g
  fiber: number | null     // g
  sugar: number | null     // g
  sodium: number | null    // mg
  tags: string[]
  status: RecipeStatus
  featured: boolean
  created_at: string
  updated_at: string
  category?: Category
}

// Cart item stored in localStorage
export interface CartRecipe {
  id: string
  slug: string
  title_es: string
  title_en: string
  image_url: string | null
  servings: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
}

// Merged ingredient for shopping list PDF
export interface ShoppingItem {
  name_es: string
  name_en: string
  amount: string
  unit: string
  unit_en: string
  section: string
  recipes: string[]  // recipe titles that use this ingredient
}
