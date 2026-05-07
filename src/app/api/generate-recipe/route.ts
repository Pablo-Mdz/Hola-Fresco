import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { config } from 'dotenv'
import { resolve } from 'path'

// Workaround for Next.js 16 Turbopack
config({ path: resolve(process.cwd(), '.env.local'), override: true })

// Strip markdown code fences if Claude wraps the JSON in ```json ... ```
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text.trim()
}

// Fix unescaped newlines/tabs inside JSON string values
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

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 })

  const systemPrompt = `Eres un chef profesional especializado en recetas fáciles, rápidas y saludables.
El usuario puede escribirte en cualquier idioma (español, inglés, alemán, italiano, francés, etc.).
Vos siempre respondés con el JSON de la receta, sin importar el idioma del input.

Respondé ÚNICAMENTE con el JSON válido, sin texto antes ni después, sin bloques de código markdown.
CRÍTICO: No uses saltos de línea literales dentro de los valores string del JSON. Todos los textos deben ir en una sola línea dentro de sus comillas.

Estructura exacta del JSON:
{
  "title_es": "Nombre en español",
  "title_en": "Name in English",
  "description_es": "Descripción apetitosa en español (2-3 oraciones)",
  "description_en": "Appetizing description in English (2-3 sentences)",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 2,
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

VALORES NUTRICIONALES — por porción, con precisión de una decimal:
- calories: kcal totales
- protein: proteínas en gramos
- carbs: carbohidratos totales en gramos
- fat: grasas totales en gramos
- fiber: fibra dietaria en gramos
- sugar: azúcares en gramos
- sodium: sodio en miligramos
Calculá los valores nutricionales sumando cada ingrediente según su cantidad real en la receta dividida por las porciones. Sé preciso como si lo fuera a leer un nutricionista.

REGLAS GENERALES:
- difficulty: solo "facil", "media" o "dificil"
- category_slug: elegí el más apropiado entre estos valores exactos: "carnes", "vegetariano", "vegano", "pastas", "ensaladas", "sopas", "postres", "desayunos", "pescados", "rapidas"
- Tiempos en minutos (números enteros)
- Secciones válidas: "Verduras", "Carnes y proteínas", "Lácteos", "Harinas y granos", "Condimentos", "Frutas", "Otros"
- Pasos claros, prácticos y fáciles de seguir
- Receta saludable y deliciosa
- Si el input está en alemán, inglés u otro idioma, interpretá la receta y generá el JSON normalmente

UNIDADES DE MEDIDA — SOLO MÉTRICAS:
- Sólidos: "g" o "kg" → ej: "200 g", "1 kg"
- Líquidos: "ml" o "l" → ej: "250 ml", "1 l"
- Excepciones permitidas (no aplica peso): "unidad", "diente", "hoja", "rodaja", "filete", "pechuga", "huevo", "lata", "pote", "frasco", "ramita", "pizca"
- PROHIBIDO: cucharada, cucharadita, taza, cup, tbsp, tsp, oz, lb, onza
- "2 cucharadas de aceite" → "30 ml"
- "1 taza de arroz" → "200 g"
- "1 cucharadita de sal" → "5 g"
- "1 cucharadita de aceite de oliva" → "5 ml"`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      system: systemPrompt,
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanText = sanitizeJSON(extractJSON(rawText))

    let recipe
    try {
      recipe = JSON.parse(cleanText)
    } catch (parseErr) {
      console.error('=== JSON PARSE ERROR ===')
      console.error('Raw length:', rawText.length)
      console.error('First 500 chars:', rawText.slice(0, 500))
      console.error('Last 200 chars:', rawText.slice(-200))
      console.error('Clean text first 300:', cleanText.slice(0, 300))
      console.error('Parse error:', parseErr)
      return NextResponse.json({ error: 'La IA devolvió un formato inesperado. Intentá de nuevo.' }, { status: 500 })
    }

    // Generate slug from Spanish title
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
    console.error('AI generation error:', err)
    return NextResponse.json({ error: 'Error al generar la receta. Intentá de nuevo.' }, { status: 500 })
  }
}
