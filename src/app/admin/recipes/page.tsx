import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import RecipesTable from '@/components/admin/RecipesTable'
import { Plus } from 'lucide-react'

export default async function AdminRecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*, category:categories(id, name_es, icon, color)')
    .order('created_at', { ascending: false })

  return (
    <AdminShell>
      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-earth-900">Recetas</h1>
            <p className="text-earth-700 text-sm mt-1">
              {recipes?.length ?? 0} recetas en total
            </p>
          </div>
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-semibold rounded-btn transition-colors"
          >
            <Plus size={16} />
            Nueva receta
          </Link>
        </div>

        <RecipesTable recipes={recipes ?? []} />
      </div>
    </AdminShell>
  )
}
