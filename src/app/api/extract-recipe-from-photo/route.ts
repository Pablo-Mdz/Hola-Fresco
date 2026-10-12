import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local'), override: true })

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text.trim()
}

function sanitizeJSON(text: string): string {
  let result = ''
  let inString = false
  let i = 0
  while (i < text.length) {
    const char = text[i]
    const prevChar = i > 0 ? text[i - 1] : ''
    if (char === '"' && prevChar !== '\\') {
      inString = !inString
      result += char
    } else if (inString && char === '\n') {
      result += '\\n'
    } else if (inString && char === '\r') {
      result += ''
    } else if (inString && char === '\t') {
      result += '\\t'
    } else {
      result += char
    }
    i++
  }
  return result
}

const SYSTEM_PROMPT = `Sos un chef profesional especializado en digitalizar recetas escritas a mano o impresas.
Tu tarea es analizar la imagen de una receta (escrita en cualquier idioma) y extraer TODA la información disponible.

Si algún campo no está en la imagen (como descripción, valores nutricionales o tips), generalo vos basándote en la receta.
Si los ingredientes no tienen cantidades exactas, estimá cantidades razonables para la cantidad de porciones indicada.

Respondé ÚNICAMENTE con JSON válido, sin texto antes ni después, sin bloques de código markdown.
CRÍTICO: No uses saltos de línea literales dentro de los valores string del JSON.

Estructura exacta del JSON:
{
  "title_es": "Nombre en español",
  "title_en": "Name in English",
  "description_es": "Descripción apetitosa en español (2-3 oraciones)",
  "description_en": "Appetizing description in English (2-3 sentences)",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 4,
  "difficulty": "facil",
  "category_slug": "carnes",
  "calories": 350,
  "protein": 28.5,
  "carbs": 42.0,
  "fat": 12.3,
  "fiber": 5.1,
  "sugar": 6.2,
  "sodium": 480.0,
  "tags": ["tag1", "tag2"],
  "tips_es": "Consejo útil del chef en español",
  "tips_en": "Useful chef tip in English",
  "ingredients": [
    {
      "name_es": "Nombre en español",
      "name_en": "Name in English",
      "amount": "200",
      "unit": "g",
      "unit_en": "g",
      "section": "Verduras"
    }
  ],
  "steps": [
    {
      "step": 1,
      "text_es": "Instrucción clara en español",
      "text_en": "Clear instruction in English"
    }
  ]
}

REGLAS:
- difficulty: solo "facil", "media" o "dificil"
- category_slug: "carnes", "vegetariano", "vegano", "pastas", "ensaladas", "sopas", "postres", "desayunos", "pescados", "rapidas"
- Tiempos en minutos (enteros)
- Secciones válidas: "Verduras", "Carnes y proteínas", "Lácteos", "Harinas y granos", "Condimentos", "Frutas", "Otros"
- Unidades métricas: "g", "kg", "ml", "l" — o "unidad", "diente", "hoja", "rodaja", "huevo", "pizca"
- Convertí medidas caseras: "1 cda" → "15 ml", "1 cdita" → "5 ml", "1 taza" → "200 g o 250 ml"
- Si no podés leer algo claramente, hacé tu mejor estimación basándote en el contexto`

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Accept either a single image or an array of pages
  const pages: { imageBase64: string; mediaType: string }[] = body.images
    ?? (body.imageBase64 ? [{ imageBase64: body.imageBase64, mediaType: body.mediaType }] : [])

  if (!pages.length) return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  const imageBlocks = pages.map(p => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: (validTypes.includes(p.mediaType) ? p.mediaType : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      data: p.imageBase64,
    },
  }))

  const pageNote = pages.length > 1
    ? `La receta está dividida en ${pages.length} páginas (imágenes). Leelas todas y combiná la información.`
    : 'Digitalizá esta receta. Extraé todos los datos y completá los que falten.'

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          ...imageBlocks,
          { type: 'text', text: pageNote },
        ],
      }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanText = sanitizeJSON(extractJSON(rawText))

    let recipe
    try {
      recipe = JSON.parse(cleanText)
    } catch {
      return NextResponse.json({ error: 'No pude interpretar la imagen. Intentá con una foto más clara.' }, { status: 500 })
    }

    const slug = (recipe.title_es ?? 'receta')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      + '-' + Date.now()

    return NextResponse.json({ ...recipe, slug })
  } catch (err) {
    console.error('Photo extraction error:', err)
    return NextResponse.json({ error: 'Error al procesar la foto. Intentá de nuevo.' }, { status: 500 })
  }
}
