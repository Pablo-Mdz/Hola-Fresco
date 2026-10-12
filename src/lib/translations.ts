import type { Lang } from '@/contexts/LangContext'

export const t = {
  nav: {
    home:    { es: 'Inicio',  en: 'Home'    },
    recipes: { es: 'Recetas', en: 'Recipes' },
    kitchen: { es: 'Cocina',  en: 'Kitchen' },
  },

  home: {
    tagline:    { es: 'Cocina rico, sin complicarte.',   en: 'Cook well, stress-free.'      },
    subtitle:   {
      es: 'Recetas fáciles y saludables con lista de compras descargable. Elegís las recetas, nosotros te decimos qué comprar.',
      en: 'Easy, healthy recipes with a downloadable shopping list. Pick your recipes, we\'ll tell you what to buy.',
    },
    viewRecipes:   { es: 'Ver recetas',  en: 'See recipes' },
    myKitchen:     { es: 'Mi Cocina',    en: 'My Kitchen'  },
    searchPlaceholder: { es: 'Buscar recetas...', en: 'Search recipes...' },
    allCategory:   { es: 'Todas',  en: 'All'   },
    emptyTitle:    { es: 'Las recetas están en camino',       en: 'Recipes are on their way'               },
    emptySubtitle: {
      es: 'Pronto vas a encontrar aquí recetas deliciosas y saludables para cocinar en casa.',
      en: 'You\'ll soon find delicious, healthy recipes to cook at home.',
    },
  },

  recipes: {
    pageTitle:        { es: 'Todas las recetas',     en: 'All recipes'         },
    available:        { es: 'disponibles',            en: 'available'           },
    recipe:           { es: 'receta',                 en: 'recipe'              },
    recipes:          { es: 'recetas',                en: 'recipes'             },
    searchPlaceholder:{ es: 'Buscar recetas...',      en: 'Search recipes...'   },
    filters:          { es: 'Filtros',                en: 'Filters'             },
    difficulty:       { es: 'Dificultad',             en: 'Difficulty'          },
    allDifficulties:  { es: 'Todas las dificultades', en: 'All difficulties'    },
    easy:             { es: 'Fácil',                  en: 'Easy'                },
    medium:           { es: 'Media',                  en: 'Medium'              },
    hard:             { es: 'Difícil',                en: 'Hard'                },
    sortBy:           { es: 'Ordenar por',            en: 'Sort by'             },
    newest:           { es: 'Más nuevas',             en: 'Newest'              },
    fastest:          { es: 'Más rápidas',            en: 'Fastest'             },
    lowestCal:        { es: 'Menos calorías',         en: 'Lowest calories'     },
    clearFilters:     { es: 'Limpiar filtros',        en: 'Clear filters'       },
    allCategory:      { es: 'Todas',                  en: 'All'                 },
    result:           { es: 'resultado',              en: 'result'              },
    results:          { es: 'resultados',             en: 'results'             },
    for:              { es: 'para',                   en: 'for'                 },
    noResultsTitle:   { es: 'No encontramos recetas', en: 'No recipes found'    },
    noResultsSubtitle:{ es: 'Probá con otras palabras o eliminá algunos filtros.', en: 'Try different words or remove some filters.' },
    seeAll:           { es: 'Ver todas las recetas',  en: 'See all recipes'     },
    featured:         { es: '⭐ Destacada',            en: '⭐ Featured'          },
  },

  detail: {
    backToHome:     { es: 'Volver al inicio',           en: 'Back to home'          },
    share:          { es: 'Compartir',                  en: 'Share'                 },
    linkCopied:     { es: '¡Link copiado!',             en: 'Link copied!'           },
    copyLink:       { es: 'Copiar link',                en: 'Copy link'             },
    shareWhatsApp:  { es: 'Compartir por WhatsApp',     en: 'Share on WhatsApp'     },
    minTotal:       { es: 'min totales',                en: 'min total'             },
    prep:           { es: 'Prep',                       en: 'Prep'                  },
    cook:           { es: 'Cocción',                    en: 'Cook'                  },
    servings:       { es: 'porciones',                  en: 'servings'              },
    serving:        { es: 'porción',                    en: 'serving'               },
    steps:          { es: 'Paso a paso',                en: 'Step by step'          },
    chefTip:        { es: 'Consejo del chef',           en: 'Chef\'s tip'            },
    inKitchenRemove:{ es: 'En tu Cocina · Quitar',      en: 'In your Kitchen · Remove' },
    added:          { es: '¡Agregada!',                 en: 'Added!'                },
    addToKitchen:   { es: 'Agregar a mi Cocina',        en: 'Add to my Kitchen'     },
    ingredients:    { es: 'Ingredientes',               en: 'Ingredients'           },
    resetTo:        { es: 'Volver a',                   en: 'Reset to'              },
    nutrition:      { es: 'Nutrición',                  en: 'Nutrition'             },
    perServing:     { es: 'por porción',                en: 'per serving'           },
    calories:       { es: 'Calorías',                   en: 'Calories'              },
    protein:        { es: 'Proteínas',                  en: 'Protein'               },
    carbs:          { es: 'Carbos',                     en: 'Carbs'                 },
    fat:            { es: 'Grasas',                     en: 'Fat'                   },
    fiber:          { es: 'Fibra',                      en: 'Fiber'                 },
    sugar:          { es: 'Azúcares',                   en: 'Sugar'                 },
    sodium:         { es: 'Sodio',                      en: 'Sodium'                },
  },

  cocina: {
    loading:        { es: 'Cargando tu Cocina...',      en: 'Loading your Kitchen...' },
    emptyTitle:     { es: 'Tu Cocina está vacía',       en: 'Your Kitchen is empty'   },
    emptySubtitle:  {
      es: 'Explorá las recetas y agregá las que más te gusten para armar tu lista de compras.',
      en: 'Browse the recipes and add your favorites to build your shopping list.',
    },
    seeRecipes:     { es: 'Ver recetas',                en: 'See recipes'             },
    title:          { es: 'Mi Cocina',                  en: 'My Kitchen'              },
    recipe:         { es: 'receta',                     en: 'recipe'                  },
    recipes:        { es: 'recetas',                    en: 'recipes'                 },
    ingredients:    { es: 'ingredientes',               en: 'ingredients'             },
    clear:          { es: 'Vaciar',                     en: 'Clear'                   },
    clearConfirm:   { es: '¿Vaciar tu Cocina?',         en: 'Clear your Kitchen?'     },
    shoppingList:   { es: 'Lista de compras',           en: 'Shopping list'           },
    generating:     { es: 'Generando...',               en: 'Generating...'           },
    downloadShopping:{ es: 'Descargar lista de compras', en: 'Download shopping list' },
    downloadRecipes: { es: 'Descargar recetas',          en: 'Download recipes'       },
    selectedRecipes: { es: 'Recetas seleccionadas',      en: 'Selected recipes'       },
    servings:       { es: 'Porciones',                  en: 'Servings'                },
    serving:        { es: 'porción',                    en: 'serving'                 },
    servingsPlural: { es: 'porciones',                  en: 'servings'                },
    addMore:        { es: '+ Agregar más recetas',      en: '+ Add more recipes'      },
    recipeCount:    { es: 'recetas',                    en: 'recipes'                 },
  },

  footer: {
    tagline: {
      es: 'Recetas fáciles, rápidas y saludables. Cocina con alegría.',
      en: 'Easy, quick and healthy recipes. Cook with joy.',
    },
    recipes: { es: 'Recetas',  en: 'Recipes'   },
    kitchen: { es: 'Mi Cocina', en: 'My Kitchen' },
  },
}

/** Get a translated string */
export function tr(key: { es: string; en: string }, lang: Lang): string {
  return lang === 'en' ? key.en : key.es
}
