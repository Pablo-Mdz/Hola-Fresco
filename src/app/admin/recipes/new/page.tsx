import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import RecipeForm from '@/components/admin/RecipeForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewRecipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <AdminShell>
      <div className="p-4 sm:p-8 max-w-[1400px]">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link href="/admin/recipes" className="p-2 text-earth-700 hover:text-earth-900 hover:bg-earth-100 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-earth-900">Nueva receta</h1>
            <p className="text-earth-700 text-sm mt-0.5">Generá con IA o completá manualmente</p>
          </div>
        </div>
        <RecipeForm categories={categories ?? []} />
      </div>
    </AdminShell>
  )
}
