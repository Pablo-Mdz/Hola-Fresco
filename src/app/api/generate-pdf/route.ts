import { NextRequest, NextResponse } from 'next/server'
import type { Recipe } from '@/types'

const SECTION_ORDER = ['Verduras', 'Frutas', 'Carnes y proteínas', 'Pescados', 'Lácteos', 'Harinas y granos', 'Condimentos', 'Otros']

function mergeIngredients(recipes: Recipe[]) {
  const map = new Map<string, { name_es: string; amount: number; unit: string; section: string; recipeNames: string[] }>()
  recipes.forEach(recipe => {
    (recipe.ingredients ?? []).forEach(ing => {
      const key = `${ing.name_es.toLowerCase()}__${ing.unit.toLowerCase()}`
      const num = parseFloat(ing.amount) || 0
      if (map.has(key)) {
        const e = map.get(key)!
        e.amount += num
        if (!e.recipeNames.includes(recipe.title_es)) e.recipeNames.push(recipe.title_es)
      } else {
        map.set(key, { name_es: ing.name_es, amount: num, unit: ing.unit, section: ing.section ?? 'Otros', recipeNames: [recipe.title_es] })
      }
    })
  })
  const grouped: Record<string, ReturnType<typeof map.values extends () => Iterator<infer V> ? () => V : never>[]> = {}
  map.forEach(item => {
    if (!grouped[item.section]) grouped[item.section] = []
    grouped[item.section].push(item as any)
  })
  return grouped
}

function buildShoppingListHTML(recipes: Recipe[]): string {
  const grouped = mergeIngredients(recipes)
  const sections = SECTION_ORDER.filter(s => grouped[s]).concat(Object.keys(grouped).filter(s => !SECTION_ORDER.includes(s)))
  const totalItems = Object.values(grouped).flat().length

  const sectionsHTML = sections.map(section => `
    <div class="section">
      <h3>${section}</h3>
      <ul>
        ${grouped[section].map((item: any) => `
          <li>
            <span class="item-name">${item.name_es}</span>
            <span class="item-qty">${Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1)} ${item.unit}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('')

  const recipeNames = recipes.map(r => `<span class="tag">${r.title_es}</span>`).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', sans-serif; color: #1c1917; padding: 48px; max-width: 700px; margin: 0 auto; }
  .header { border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 28px; }
  .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .logo-icon { font-size: 24px; }
  .logo-text { font-size: 22px; font-weight: 800; color: #15803d; }
  h1 { font-size: 26px; font-weight: 700; color: #1c1917; margin-bottom: 6px; }
  .subtitle { font-size: 13px; color: #78716c; margin-bottom: 10px; }
  .recipes-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .stats { background: #f0fdf4; border-radius: 12px; padding: 14px 18px; margin-bottom: 28px; font-size: 13px; color: #15803d; font-weight: 600; }
  .section { margin-bottom: 22px; }
  .section h3 { font-size: 11px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #dcfce7; }
  ul { list-style: none; }
  li { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f5f5f4; }
  li:last-child { border-bottom: none; }
  .item-name { font-size: 14px; color: #1c1917; }
  .item-qty { font-size: 13px; font-weight: 600; color: #292524; background: #f5f5f4; padding: 2px 10px; border-radius: 20px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #a8a29e; text-align: center; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <span class="logo-icon">🥬</span>
      <span class="logo-text">Hola Fresco</span>
    </div>
    <h1>Lista de compras</h1>
    <p class="subtitle">Generada el ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <div class="recipes-list">${recipeNames}</div>
  </div>
  <div class="stats">🛒 ${totalItems} ingredientes para ${recipes.length} ${recipes.length === 1 ? 'receta' : 'recetas'}</div>
  ${sectionsHTML}
  <div class="footer">Hola Fresco · Recetas fáciles y saludables para cocinar en casa</div>
</body>
</html>`
}

function buildRecipesHTML(recipes: Recipe[]): string {
  const recipesHTML = recipes.map((recipe, idx) => {
    const ingredientsBySection: Record<string, typeof recipe.ingredients> = {}
    ;(recipe.ingredients ?? []).forEach(ing => {
      const s = ing.section ?? 'Otros'
      if (!ingredientsBySection[s]) ingredientsBySection[s] = []
      ingredientsBySection[s].push(ing)
    })

    const ingredientsHTML = Object.entries(ingredientsBySection).map(([section, items]) => `
      <div class="ing-section">
        <h4>${section}</h4>
        <ul class="ing-list">
          ${items.map(ing => `<li><span>${ing.name_es}</span><span class="qty">${ing.amount} ${ing.unit}</span></li>`).join('')}
        </ul>
      </div>
    `).join('')

    const stepsHTML = (recipe.steps ?? []).map(s => `
      <div class="step">
        <span class="step-num">${s.step}</span>
        <p>${s.text_es}</p>
      </div>
    `).join('')

    return `
      ${idx > 0 ? '<div class="page-break"></div>' : ''}
      <div class="recipe">
        ${recipe.image_url ? `
        <div class="recipe-img-wrap">
          <img class="recipe-img" src="${recipe.image_url}" alt="${recipe.title_es}" />
        </div>` : ''}
        <div class="recipe-header">
          <span class="recipe-cat">${recipe.category?.icon ?? '🍽️'} ${recipe.category?.name_es ?? ''}</span>
          <h2>${recipe.title_es}</h2>
          ${recipe.description_es ? `<p class="recipe-desc">${recipe.description_es}</p>` : ''}
          <div class="recipe-meta">
            <span>⏱ ${recipe.prep_time + recipe.cook_time} min</span>
            <span>👥 ${recipe.servings} porciones</span>
            <span>📊 ${recipe.difficulty === 'facil' ? 'Fácil' : recipe.difficulty === 'media' ? 'Media' : 'Difícil'}</span>
            ${recipe.calories ? `<span>🔥 ${recipe.calories} kcal</span>` : ''}
          </div>
        </div>
        <div class="recipe-body">
          <div class="ingredients">
            <h3>Ingredientes</h3>
            ${ingredientsHTML}
            ${recipe.calories ? `
            <div class="nutrition-box">
              <h4>Nutrición <span class="per-serving">por porción</span></h4>
              <div class="kcal-row">
                <span>Calorías</span>
                <strong>${recipe.calories} kcal</strong>
              </div>
              ${recipe.protein  != null ? `<div class="n-row"><span>Proteínas</span><span>${recipe.protein} g</span></div>` : ''}
              ${recipe.carbs    != null ? `<div class="n-row"><span>Carbohidratos</span><span>${recipe.carbs} g</span></div>` : ''}
              ${recipe.fat      != null ? `<div class="n-row"><span>Grasas</span><span>${recipe.fat} g</span></div>` : ''}
              ${recipe.fiber    != null ? `<div class="n-row"><span>Fibra</span><span>${recipe.fiber} g</span></div>` : ''}
              ${recipe.sugar    != null ? `<div class="n-row"><span>Azúcares</span><span>${recipe.sugar} g</span></div>` : ''}
              ${recipe.sodium   != null ? `<div class="n-row"><span>Sodio</span><span>${recipe.sodium} mg</span></div>` : ''}
            </div>` : ''}
          </div>
          <div class="steps">
            <h3>Preparación</h3>
            ${stepsHTML}
            ${recipe.tips_es ? `<div class="tip">💡 <strong>Consejo:</strong> ${recipe.tips_es}</div>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', sans-serif; color: #1c1917; padding: 48px; max-width: 720px; margin: 0 auto; }
  .main-header { border-bottom: 3px solid #22c55e; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 20px; font-weight: 800; color: #15803d; }
  .main-header p { font-size: 12px; color: #78716c; }
  .page-break { page-break-before: always; height: 32px; }
  .recipe-img-wrap { width: 100%; height: 220px; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
  .recipe-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .recipe-header { background: linear-gradient(135deg, #f0fdf4, #fefce8); border-radius: 14px; padding: 20px; margin-bottom: 20px; }
  .recipe-cat { font-size: 11px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.08em; }
  h2 { font-size: 26px; font-weight: 800; color: #1c1917; margin: 6px 0; }
  .recipe-desc { font-size: 14px; color: #57534e; line-height: 1.5; margin-top: 6px; }
  .recipe-meta { display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #292524; font-weight: 600; }
  .recipe-body { display: grid; grid-template-columns: 200px 1fr; gap: 24px; }
  h3 { font-size: 14px; font-weight: 700; color: #1c1917; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #22c55e; }
  .ing-section h4 { font-size: 10px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.06em; margin: 10px 0 5px; }
  .ing-list { list-style: none; }
  .ing-list li { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #f5f5f4; }
  .qty { font-weight: 600; color: #292524; }
  .step { display: flex; gap: 12px; margin-bottom: 12px; }
  .step-num { width: 24px; height: 24px; background: #22c55e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .step p { font-size: 13px; color: #1c1917; line-height: 1.6; }
  .tip { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #78716c; margin-top: 16px; line-height: 1.5; }
  .nutrition-box { margin-top: 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; }
  .nutrition-box h4 { font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .per-serving { font-weight: 400; color: #86efac; font-size: 10px; text-transform: none; letter-spacing: 0; }
  .kcal-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #14532d; background: #dcfce7; border-radius: 6px; padding: 5px 8px; margin-bottom: 6px; }
  .n-row { display: flex; justify-content: space-between; font-size: 11px; color: #374151; padding: 3px 0; border-bottom: 1px solid #d1fae5; }
  .n-row:last-child { border-bottom: none; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #a8a29e; text-align: center; }
  @media print { body { padding: 24px; } .page-break { height: 0; } }
</style>
</head>
<body>
  <div class="main-header">
    <span class="logo">🥬 Hola Fresco</span>
    <p>${recipes.length} ${recipes.length === 1 ? 'receta' : 'recetas'} · ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
  ${recipesHTML}
  <div class="footer">Hola Fresco · Recetas fáciles y saludables para cocinar en casa</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { recipes, type } = await req.json() as { recipes: Recipe[]; type: 'shopping' | 'recipes' }

  if (!recipes?.length) {
    return NextResponse.json({ error: 'No hay recetas' }, { status: 400 })
  }

  const html = type === 'shopping' ? buildShoppingListHTML(recipes) : buildRecipesHTML(recipes)

  // Return HTML for browser printing (user prints to PDF)
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
