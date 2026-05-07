import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RecipeDetail from '@/components/recipe/RecipeDetail'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, category:categories(id, slug, name_es, name_en, icon, color, sort_order, created_at)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!recipe) notFound()

  return (
    <>
      <Header />
      <main className="flex-1">
        <RecipeDetail recipe={recipe} />
      </main>
      <Footer />
    </>
  )
}
