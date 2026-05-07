'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Eye, EyeOff, Clock, AlertTriangle } from 'lucide-react'
import type { Recipe } from '@/types'
import { useState } from 'react'

interface Props {
  recipes: (Recipe & { category?: { id: string; name_es: string; icon: string; color: string } | null })[]
}

interface DeleteTarget {
  id: string
  title: string
}

export default function RecipesTable({ recipes: initial }: Props) {
  const router = useRouter()
  const [recipes, setRecipes] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  async function toggleStatus(id: string, current: string) {
    const supabase = createClient()
    const next = current === 'published' ? 'draft' : 'published'
    await supabase.from('recipes').update({ status: next }).eq('id', id)
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, status: next as 'draft' | 'published' } : r))
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    setDeleteTarget(null)
    const supabase = createClient()
    await supabase.from('recipes').delete().eq('id', deleteTarget.id)
    setRecipes(prev => prev.filter(r => r.id !== deleteTarget.id))
    setDeleting(null)
  }

  const difficultyLabel: Record<string, string> = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' }

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-earth-200 p-16 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <p className="font-display font-semibold text-earth-900 text-lg mb-1">Todavía no hay recetas</p>
        <p className="text-earth-700 text-sm mb-6">Creá tu primera receta o generá una con IA.</p>
        <Link
          href="/admin/recipes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-semibold rounded-btn transition-colors"
        >
          + Nueva receta
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={22} />
            </div>

            <h2 className="font-display font-bold text-earth-900 text-lg text-center mb-1">
              ¿Eliminar receta?
            </h2>
            <p className="text-earth-700 text-sm text-center mb-1">
              Vas a eliminar permanentemente:
            </p>
            <p className="font-semibold text-earth-900 text-sm text-center mb-5 px-2">
              &ldquo;{deleteTarget.title}&rdquo;
            </p>
            <p className="text-xs text-earth-500 text-center mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-earth-200 hover:bg-earth-50 text-earth-700 font-medium text-sm rounded-btn transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold text-sm rounded-btn transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile cards ── */}
      <div className="sm:hidden flex flex-col gap-3">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl border border-earth-200 p-4">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-fresh-50 flex-shrink-0">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {recipe.category?.icon ?? '🍽️'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-earth-900 leading-snug truncate">{recipe.title_es}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {recipe.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-earth-100 text-earth-700">
                      {recipe.category.icon} {recipe.category.name_es}
                    </span>
                  )}
                  <span className="text-xs text-earth-500">{difficultyLabel[recipe.difficulty]}</span>
                  <span className="flex items-center gap-0.5 text-xs text-earth-500">
                    <Clock size={11} />
                    {recipe.prep_time + recipe.cook_time} min
                  </span>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-earth-100">
              <button
                onClick={() => toggleStatus(recipe.id, recipe.status)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  recipe.status === 'published'
                    ? 'bg-fresh-100 text-fresh-700 hover:bg-fresh-200'
                    : 'bg-lemon-100 text-lemon-600 hover:bg-lemon-200'
                }`}
              >
                {recipe.status === 'published' ? <Eye size={11} /> : <EyeOff size={11} />}
                {recipe.status === 'published' ? 'Publicada' : 'Borrador'}
              </button>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/recipes/${recipe.id}`}
                  className="p-2 text-earth-700 hover:text-fresh-600 hover:bg-fresh-50 rounded-lg transition-colors"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => setDeleteTarget({ id: recipe.id, title: recipe.title_es })}
                  disabled={deleting === recipe.id}
                  className="p-2 text-earth-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-earth-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-earth-100 bg-earth-50">
              <th className="text-left px-5 py-3.5 font-semibold text-earth-700 text-xs uppercase tracking-wide">Receta</th>
              <th className="text-left px-4 py-3.5 font-semibold text-earth-700 text-xs uppercase tracking-wide">Categoría</th>
              <th className="text-left px-4 py-3.5 font-semibold text-earth-700 text-xs uppercase tracking-wide">Dificultad</th>
              <th className="text-left px-4 py-3.5 font-semibold text-earth-700 text-xs uppercase tracking-wide">Tiempo</th>
              <th className="text-left px-4 py-3.5 font-semibold text-earth-700 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {recipes.map(recipe => (
              <tr key={recipe.id} className="hover:bg-earth-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-fresh-50 flex items-center justify-center text-xl flex-shrink-0">
                        {recipe.category?.icon ?? '🍽️'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-earth-900 leading-snug">{recipe.title_es}</p>
                      <p className="text-earth-700 text-xs mt-0.5 truncate max-w-[200px]">{recipe.title_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {recipe.category ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-earth-100 text-earth-700">
                      {recipe.category.icon} {recipe.category.name_es}
                    </span>
                  ) : (
                    <span className="text-earth-700 text-xs">Sin categoría</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-earth-700 text-xs">{difficultyLabel[recipe.difficulty]}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-earth-700 text-xs">
                    <Clock size={12} />
                    {recipe.prep_time + recipe.cook_time} min
                  </div>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => toggleStatus(recipe.id, recipe.status)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      recipe.status === 'published'
                        ? 'bg-fresh-100 text-fresh-700 hover:bg-fresh-200'
                        : 'bg-lemon-100 text-lemon-600 hover:bg-lemon-200'
                    }`}
                  >
                    {recipe.status === 'published' ? <Eye size={11} /> : <EyeOff size={11} />}
                    {recipe.status === 'published' ? 'Publicada' : 'Borrador'}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/admin/recipes/${recipe.id}`}
                      className="p-2 text-earth-700 hover:text-fresh-600 hover:bg-fresh-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ id: recipe.id, title: recipe.title_es })}
                      disabled={deleting === recipe.id}
                      className="p-2 text-earth-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
