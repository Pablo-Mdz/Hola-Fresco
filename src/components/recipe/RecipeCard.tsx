import Link from 'next/link'
import { Clock, Users, Flame } from 'lucide-react'
import type { Recipe } from '@/types'

const difficultyLabel: Record<string, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
}

const difficultyColor: Record<string, string> = {
  facil: 'bg-fresh-100 text-fresh-700',
  media: 'bg-lemon-100 text-lemon-600',
  dificil: 'bg-red-100 text-red-600',
}

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prep_time + recipe.cook_time

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group bg-white rounded-card border border-earth-200 overflow-hidden hover:border-fresh-300 hover:shadow-md transition-all flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-fresh-50 overflow-hidden">
        {recipe.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image_url}
            alt={recipe.title_es}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {recipe.category?.icon ?? '🍽️'}
          </div>
        )}
        {recipe.featured && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-lemon-400 text-earth-900 text-xs font-bold rounded-full">
            ⭐ Destacada
          </span>
        )}
        <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColor[recipe.difficulty]}`}>
          {difficultyLabel[recipe.difficulty]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {recipe.category && (
          <span className="text-xs font-semibold text-fresh-600 uppercase tracking-wide mb-1">
            {recipe.category.icon} {recipe.category.name_es}
          </span>
        )}
        <h3 className="font-display font-semibold text-earth-900 text-base leading-snug mb-2 group-hover:text-fresh-700 transition-colors line-clamp-2">
          {recipe.title_es}
        </h3>
        {recipe.description_es && (
          <p className="text-earth-700 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
            {recipe.description_es}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-earth-700 text-xs mt-auto pt-3 border-t border-earth-100">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {totalTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {recipe.servings}
          </span>
          {recipe.calories && (
            <span className="flex items-center gap-1">
              <Flame size={13} />
              {recipe.calories} kcal
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
