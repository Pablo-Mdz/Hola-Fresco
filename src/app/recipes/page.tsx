import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RecipesClient from '@/components/recipe/RecipesClient'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata = {
  title: 'Recetas | Hola Fresco',
  description: 'Explorá todas nuestras recetas fáciles y saludables con lista de compras descargable.',
}

export default async function RecipesPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: recipes }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('recipes')
      .select('*, category:categories(id, slug, name_es, name_en, icon, color, sort_order, created_at)')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
  ])

  return (
    <>
      <Header />
      <main className="flex-1">
        <RecipesClient categories={categories ?? []} recipes={recipes ?? []} />
      </main>
      <Footer />
    </>
  )
}
