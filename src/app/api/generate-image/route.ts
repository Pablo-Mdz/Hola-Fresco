import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local'), override: true })

async function searchUnsplash(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape&client_id=${key}`
    )
    const data = await res.json()
    const photos = data.results ?? []
    if (!photos.length) return null
    const pick = photos[Math.floor(Math.random() * photos.length)]
    return pick.urls?.regular ?? null
  } catch {
    return null
  }
}

// Remove location/style qualifiers, keep only the core food noun
// "Mendoza-Style Empanadas" → "Empanadas"
// "Lemon Herb Chicken" → "Chicken"
function extractFoodKeyword(title: string): string {
  const noise = /\b(style|inspired|homemade|classic|easy|quick|crispy|creamy|spicy|grilled|baked|fried|roasted|stuffed|fresh|healthy|traditional|authentic|argentinian?|mexican|italian|french|greek|thai|asian|mediterranean|mendocino?|mendoza)\b/gi
  const cleaned = title.replace(noise, '').replace(/\s+/g, ' ').trim()
  // Return last 1-2 meaningful words (tends to be the dish name)
  const words = cleaned.split(' ').filter(w => w.length > 2)
  return words.slice(-2).join(' ') || title
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title_es, title_en, custom_query } = await req.json()
  if (!title_es && !custom_query) return NextResponse.json({ error: 'Título requerido' }, { status: 400 })

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY no configurada' }, { status: 500 })
  }

  // If user typed a custom search term, use it directly
  if (custom_query) {
    const imageUrl = await searchUnsplash(`${custom_query} food`)
    if (!imageUrl) return NextResponse.json({ error: 'No se encontró imagen' }, { status: 404 })
    return NextResponse.json({ image_url: imageUrl })
  }

  // Auto: strip location/style noise, keep the food noun
  const keyword = extractFoodKeyword(title_en ?? title_es)
  const imageUrl =
    await searchUnsplash(`${keyword} food dish`) ??
    await searchUnsplash(extractFoodKeyword(title_es))

  if (!imageUrl) return NextResponse.json({ error: 'No se encontró imagen' }, { status: 404 })

  return NextResponse.json({ image_url: imageUrl })
}
