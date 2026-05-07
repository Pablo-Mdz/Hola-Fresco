'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, Trash2, Eye, EyeOff, Loader2, ImageIcon, RefreshCw, X } from 'lucide-react'
import type { Recipe, Category, Ingredient, RecipeStep } from '@/types'

interface Props {
  recipe?: Recipe
  categories: Category[]
}

const SECTIONS = ['Verduras', 'Carnes y proteínas', 'Lácteos', 'Harinas y granos', 'Condimentos', 'Frutas', 'Otros']

const emptyIngredient = (): Ingredient => ({
  name_es: '', name_en: '', amount: '', unit: '', unit_en: '', section: 'Otros'
})

const emptyStep = (step: number): RecipeStep => ({
  step, text_es: '', text_en: ''
})

export default function RecipeForm({ recipe, categories }: Props) {
  const router = useRouter()
  const isEdit = !!recipe

  // AI prompt
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Form fields
  const [titleEs, setTitleEs] = useState(recipe?.title_es ?? '')
  const [titleEn, setTitleEn] = useState(recipe?.title_en ?? '')
  const [descEs, setDescEs] = useState(recipe?.description_es ?? '')
  const [descEn, setDescEn] = useState(recipe?.description_en ?? '')
  const [categoryId, setCategoryId] = useState(recipe?.category_id ?? '')
  const [prepTime, setPrepTime] = useState(recipe?.prep_time ?? 15)
  const [cookTime, setCookTime] = useState(recipe?.cook_time ?? 20)
  const [servings, setServings] = useState(recipe?.servings ?? 2)
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? 'facil')
  const [calories, setCalories] = useState<number | string>(recipe?.calories ?? '')
  const [protein, setProtein] = useState<number | string>(recipe?.protein ?? '')
  const [carbs, setCarbs] = useState<number | string>(recipe?.carbs ?? '')
  const [fat, setFat] = useState<number | string>(recipe?.fat ?? '')
  const [fiber, setFiber] = useState<number | string>(recipe?.fiber ?? '')
  const [sugar, setSugar] = useState<number | string>(recipe?.sugar ?? '')
  const [sodium, setSodium] = useState<number | string>(recipe?.sodium ?? '')
  const [tipsEs, setTipsEs] = useState(recipe?.tips_es ?? '')
  const [tipsEn, setTipsEn] = useState(recipe?.tips_en ?? '')
  const [tags, setTags] = useState((recipe?.tags ?? []).join(', '))
  const [status, setStatus] = useState(recipe?.status ?? 'draft')
  const [featured, setFeatured] = useState(recipe?.featured ?? false)
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients ?? [emptyIngredient()])
  const [steps, setSteps] = useState<RecipeStep[]>(recipe?.steps ?? [emptyStep(1)])
  const [slug, setSlug] = useState(recipe?.slug ?? '')

  const [imageUrl, setImageUrl] = useState(recipe?.image_url ?? '')
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [imageSearch, setImageSearch] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Image search (Unsplash) ──
  async function generateImage(title_es: string, title_en: string, customQuery?: string) {
    setImageLoading(true)
    setImageError('')
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title_es, title_en, custom_query: customQuery || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImageUrl(data.image_url ?? '')
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Error al buscar imagen')
    } finally {
      setImageLoading(false)
    }
  }

  // ── AI generation ──
  async function generateWithAI() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setTitleEs(data.title_es ?? '')
      setTitleEn(data.title_en ?? '')
      setDescEs(data.description_es ?? '')
      setDescEn(data.description_en ?? '')
      setPrepTime(data.prep_time ?? 15)
      setCookTime(data.cook_time ?? 20)
      setServings(data.servings ?? 2)
      setDifficulty(data.difficulty ?? 'facil')
      setCalories(data.calories ?? '')
      setProtein(data.protein ?? '')
      setCarbs(data.carbs ?? '')
      setFat(data.fat ?? '')
      setFiber(data.fiber ?? '')
      setSugar(data.sugar ?? '')
      setSodium(data.sodium ?? '')
      setTipsEs(data.tips_es ?? '')
      setTipsEn(data.tips_en ?? '')
      setTags((data.tags ?? []).join(', '))
      setIngredients(data.ingredients?.length ? data.ingredients : [emptyIngredient()])
      setSteps(data.steps?.length ? data.steps : [emptyStep(1)])
      if (!isEdit) setSlug(data.slug ?? '')
      // Auto-select category from AI suggestion
      if (data.category_slug) {
        const match = categories.find(c => c.slug === data.category_slug)
        if (match) setCategoryId(match.id)
      }

      // Auto-fetch a matching photo from Unsplash (non-blocking)
      generateImage(data.title_es ?? '', data.title_en ?? '')
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Save ──
  async function handleSave(publish?: boolean) {
    setSaving(true)
    setSaveError('')
    const finalStatus = publish !== undefined ? (publish ? 'published' : 'draft') : status

    const body = {
      slug: slug || titleEs.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + (isEdit ? '' : '-' + Date.now()),
      title_es: titleEs, title_en: titleEn,
      description_es: descEs, description_en: descEn,
      category_id: categoryId || null,
      prep_time: Number(prepTime), cook_time: Number(cookTime),
      servings: Number(servings), difficulty,
      calories: calories !== '' ? Number(calories) : null,
      protein: protein !== '' ? Number(protein) : null,
      carbs:   carbs   !== '' ? Number(carbs)   : null,
      fat:     fat     !== '' ? Number(fat)      : null,
      fiber:   fiber   !== '' ? Number(fiber)    : null,
      sugar:   sugar   !== '' ? Number(sugar)    : null,
      sodium:  sodium  !== '' ? Number(sodium)   : null,
      tips_es: tipsEs, tips_en: tipsEn,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      image_url: imageUrl || null,
      ingredients, steps,
      status: finalStatus,
      featured,
    }

    try {
      const url = isEdit ? `/api/recipes/${recipe!.id}` : '/api/recipes'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/recipes')
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
      setSaving(false)
    }
  }

  // ── Ingredients helpers ──
  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }
  function addIngredient() { setIngredients(prev => [...prev, emptyIngredient()]) }
  function removeIngredient(i: number) { setIngredients(prev => prev.filter((_, idx) => idx !== i)) }

  // ── Steps helpers ──
  function updateStep(i: number, field: 'text_es' | 'text_en', value: string) {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }
  function addStep() { setSteps(prev => [...prev, emptyStep(prev.length + 1)]) }
  function removeStep(i: number) {
    setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step: idx + 1 })))
  }

  return (
    <div className="w-full">

      {/* ── AI Generator ── */}
      <div className="bg-gradient-to-r from-fresh-50 to-lemon-50 border border-fresh-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-fresh-600" size={18} />
          <h2 className="font-semibold text-fresh-800">Generar receta con IA</h2>
        </div>
        <p className="text-earth-700 text-sm mb-4">
          Describí la receta en cualquier idioma. Podés mencionar ingredientes, tipo de cocina, tiempo disponible o cualquier idea.
        </p>
        <div className="flex gap-3">
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="Ej: Pollo al limón con verduras de temporada, fácil, 30 minutos para 2 personas..."
            rows={3}
            className="flex-1 px-4 py-3 border border-fresh-200 rounded-xl text-sm text-earth-900 placeholder:text-earth-500 focus:outline-none focus:ring-2 focus:ring-fresh-400 bg-white resize-none"
          />
          <button
            onClick={generateWithAI}
            disabled={aiLoading || !aiPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-fresh-500 hover:bg-fresh-600 disabled:bg-fresh-300 text-white font-semibold rounded-xl transition-colors self-start"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {aiLoading ? 'Generando...' : 'Generar'}
          </button>
        </div>
        {aiError && <p className="text-red-600 text-sm mt-2">{aiError}</p>}
        {aiLoading && (
          <p className="text-fresh-600 text-sm mt-2 flex items-center gap-1.5">
            <Loader2 size={13} className="animate-spin" />
            Claude está creando tu receta...
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">

        {/* ── Left: main fields ── */}
        <div className="flex flex-col gap-6">

          {/* Títulos */}
          <section className="bg-white rounded-2xl border border-earth-200 p-6">
            <h3 className="font-semibold text-earth-900 mb-5">Título y descripción</h3>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Título en español *</label>
                  <input value={titleEs} onChange={e => setTitleEs(e.target.value)} className="input-field text-sm" placeholder="Pollo al limón con hierbas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Title in English *</label>
                  <input value={titleEn} onChange={e => setTitleEn(e.target.value)} className="input-field text-sm" placeholder="Lemon herb chicken" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Descripción ES</label>
                  <textarea value={descEs} onChange={e => setDescEs(e.target.value)} rows={4} className="input-field text-sm resize-y" placeholder="Descripción apetitosa en español..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">Description EN</label>
                  <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={4} className="input-field text-sm resize-y" placeholder="Appetizing description in English..." />
                </div>
              </div>
            </div>
          </section>

          {/* Ingredientes */}
          <section className="bg-white rounded-2xl border border-earth-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-earth-900">Ingredientes ({ingredients.length})</h3>
              <button onClick={addIngredient} className="inline-flex items-center gap-1.5 text-sm text-fresh-600 hover:text-fresh-700 font-medium">
                <Plus size={15} /> Agregar
              </button>
            </div>
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_90px_110px_150px_36px] gap-2 mb-2 px-1">
              {['Nombre ES', 'Name EN', 'Cantidad', 'Unidad', 'Sección', ''].map(h => (
                <span key={h} className="text-xs font-semibold text-earth-500 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_90px_110px_150px_36px] gap-2 items-center">
                  <input value={ing.name_es} onChange={e => updateIngredient(i, 'name_es', e.target.value)} className="input-field text-sm" placeholder="Tomate cherry" />
                  <input value={ing.name_en} onChange={e => updateIngredient(i, 'name_en', e.target.value)} className="input-field text-sm" placeholder="Cherry tomato" />
                  <input value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} className="input-field text-sm" placeholder="200" />
                  <input value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} className="input-field text-sm" placeholder="g" />
                  <select value={ing.section} onChange={e => updateIngredient(i, 'section', e.target.value)} className="input-field text-sm">
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => removeIngredient(i)} className="p-2 text-earth-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Pasos */}
          <section className="bg-white rounded-2xl border border-earth-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-earth-900">Paso a paso ({steps.length} pasos)</h3>
              <button onClick={addStep} className="inline-flex items-center gap-1.5 text-sm text-fresh-600 hover:text-fresh-700 font-medium">
                <Plus size={15} /> Agregar paso
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-8 h-8 bg-fresh-100 text-fresh-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    {step.step}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <textarea
                      value={step.text_es}
                      onChange={e => updateStep(i, 'text_es', e.target.value)}
                      rows={3}
                      className="input-field text-sm resize-y"
                      placeholder="Instrucción en español..."
                    />
                    <textarea
                      value={step.text_en}
                      onChange={e => updateStep(i, 'text_en', e.target.value)}
                      rows={3}
                      className="input-field text-sm resize-y"
                      placeholder="Instruction in English..."
                    />
                  </div>
                  <button onClick={() => removeStep(i)} className="p-2 text-earth-400 hover:text-red-500 transition-colors mt-1 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Consejos */}
          <section className="bg-white rounded-2xl border border-earth-200 p-6">
            <h3 className="font-semibold text-earth-900 mb-4">Consejo del chef</h3>
            <div className="grid grid-cols-2 gap-4">
              <textarea value={tipsEs} onChange={e => setTipsEs(e.target.value)} rows={3} className="input-field text-sm resize-y" placeholder="Consejo útil en español..." />
              <textarea value={tipsEn} onChange={e => setTipsEn(e.target.value)} rows={3} className="input-field text-sm resize-y" placeholder="Useful tip in English..." />
            </div>
          </section>
        </div>

        {/* ── Right: meta & actions ── */}
        <div className="flex flex-col gap-4">

          {/* Imagen */}
          <section className="bg-white rounded-2xl border border-earth-200 p-5">
            <h3 className="font-semibold text-earth-900 mb-3">Foto del plato</h3>

            {/* Preview */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-earth-50 border border-earth-200 mb-3">
              {imageLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-earth-500">
                  <Loader2 size={28} className="animate-spin text-fresh-500" />
                  <span className="text-xs font-medium text-fresh-600">Buscando foto...</span>
                  <span className="text-xs text-earth-400">Buscando en Unsplash...</span>
                </div>
              ) : imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Foto del plato"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-earth-400">
                  <ImageIcon size={32} />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-red-600 text-xs mb-2 bg-red-50 px-3 py-2 rounded-lg">{imageError}</p>
            )}

            {/* Auto search button */}
            <button
              onClick={() => generateImage(titleEs, titleEn)}
              disabled={imageLoading || !titleEs}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-earth-200 hover:border-fresh-400 hover:text-fresh-600 disabled:opacity-40 text-earth-700 text-sm font-medium rounded-btn transition-colors"
            >
              <RefreshCw size={14} className={imageLoading ? 'animate-spin' : ''} />
              {imageUrl ? 'Buscar otra foto' : 'Buscar foto'}
            </button>

            {/* Manual search */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-earth-500 mb-1.5">Buscar con otras palabras</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={imageSearch}
                  onChange={e => setImageSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && imageSearch.trim() && generateImage(titleEs, titleEn, imageSearch.trim())}
                  placeholder="ej: empanadas argentinas"
                  className="input-field text-xs flex-1"
                />
                <button
                  onClick={() => imageSearch.trim() && generateImage(titleEs, titleEn, imageSearch.trim())}
                  disabled={imageLoading || !imageSearch.trim()}
                  className="px-3 py-2 bg-fresh-500 hover:bg-fresh-600 disabled:opacity-40 text-white text-xs font-medium rounded-btn transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </section>

          {/* Publicar */}
          <section className="bg-white rounded-2xl border border-earth-200 p-5">
            <h3 className="font-semibold text-earth-900 mb-4">Publicación</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-earth-700">Estado</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status === 'published' ? 'bg-fresh-100 text-fresh-700' : 'bg-lemon-100 text-lemon-600'}`}>
                {status === 'published' ? '✓ Publicada' : '○ Borrador'}
              </span>
            </div>

            <label className="flex items-center gap-2 mb-5 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-fresh-500" />
              <span className="text-sm text-earth-700">Destacada ⭐</span>
            </label>

            {saveError && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !titleEs}
                className="w-full flex items-center justify-center gap-2 py-3 bg-fresh-500 hover:bg-fresh-600 disabled:bg-fresh-300 text-white font-semibold rounded-btn transition-colors"
              >
                <Eye size={15} />
                {saving ? 'Guardando...' : 'Publicar'}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !titleEs}
                className="w-full flex items-center justify-center gap-2 py-3 bg-earth-100 hover:bg-earth-200 disabled:opacity-50 text-earth-700 font-medium rounded-btn transition-colors"
              >
                <EyeOff size={15} />
                Guardar borrador
              </button>
            </div>
          </section>

          {/* Detalles */}
          <section className="bg-white rounded-2xl border border-earth-200 p-5">
            <h3 className="font-semibold text-earth-900 mb-4">Detalles</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Categoría</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field text-sm">
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name_es}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Dificultad</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as 'facil' | 'media' | 'dificil')} className="input-field text-sm">
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">Prep (min)</label>
                  <input type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} className="input-field text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">Cocción (min)</label>
                  <input type="number" value={cookTime} onChange={e => setCookTime(Number(e.target.value))} className="input-field text-sm" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">Porciones</label>
                  <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} className="input-field text-sm" min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">Calorías</label>
                  <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input-field text-sm" placeholder="350" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Tags</label>
                <input value={tags} onChange={e => setTags(e.target.value)} className="input-field text-sm" placeholder="saludable, rápido, sin gluten" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
