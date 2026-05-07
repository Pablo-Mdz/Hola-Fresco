import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RecipeDetail from '@/components/recipe/RecipeDetail'
import { siteUrl } from '@/lib/site'

// Dynamic OG metadata per recipe — this is what WhatsApp/Twitter reads
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('title_es, description_es, image_url, category:categories(name_es, icon)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!recipe) return { title: 'Receta no encontrada' }

  const title = recipe.title_es
  const description = recipe.description_es ?? 'Receta fácil y saludable de Hola Fresco.'
  const image = recipe.image_url
  const url = `${siteUrl()}/recipes/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      ...(image && { images: [{ url: image, width: 1080, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

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
