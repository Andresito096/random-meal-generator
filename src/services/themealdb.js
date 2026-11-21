const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1'
const INGREDIENT_SLOTS = 20

async function getMeals(path, params, signal) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`${API_BASE_URL}/${path}?${searchParams}`, { signal })

  if (!response.ok) {
    throw new Error(`TheMealDB request failed (${response.status}).`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('TheMealDB returned an unreadable response.')
  }

  if (!data || typeof data !== 'object' || !('meals' in data)) {
    throw new Error('TheMealDB returned an unexpected response.')
  }
  if (data.meals !== null && !Array.isArray(data.meals)) {
    throw new Error('TheMealDB returned an invalid recipe list.')
  }

  return data.meals ?? []
}

function mapMeal(meal) {
  const ingredients = Array.from({ length: INGREDIENT_SLOTS }, (_, index) => {
    const ingredient = meal[`strIngredient${index + 1}`]?.trim()
    const measure = meal[`strMeasure${index + 1}`]?.trim()

    if (!ingredient) return ''
    return measure ? `${measure} ${ingredient}` : ingredient
  }).filter(Boolean)

  const steps = (meal.strInstructions ?? '')
    .split(/\r?\n/)
    .map((step) => step.trim().replace(/^step\s*\d*[\s.:/-]*/i, ''))
    .filter(Boolean)
  const tags = (meal.strTags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const category = meal.strCategory ?? ''
  const dietary = []

  if (category.toLowerCase() === 'vegan') dietary.push('Vegan', 'Vegetarian')
  if (category.toLowerCase() === 'vegetarian') dietary.push('Vegetarian')
  if (tags.some((tag) => tag.toLowerCase() === 'gluten-free')) {
    dietary.push('Gluten-free')
  }

  const ingredientTags = ingredients.map((ingredient) =>
    ingredient.replace(/^[\d¼½¾⅓⅔⅛⅜⅝⅞./\s-]+/, '').toLowerCase()
  )

  return {
    id: `themealdb-${meal.idMeal}`,
    themealdbId: meal.idMeal,
    source: 'themealdb',
    name: meal.strMeal,
    cuisine: meal.strArea || 'International',
    category,
    dietary,
    difficulty: '',
    time: null,
    servings: null,
    calories: null,
    rating: null,
    image: meal.strMealThumb ?? '',
    imageAlt: `Photo of ${meal.strMeal}`,
    description:
      steps[0] ||
      `${category ? `${category} recipe` : 'Recipe'} from ${meal.strArea || 'TheMealDB'}.`,
    tags: [...tags, ...ingredientTags, category, meal.strArea].filter(Boolean),
    ingredients,
    steps,
    sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
    videoUrl: meal.strYoutube || '',
  }
}

function mergeMeals(mealGroups) {
  const mealsById = new Map()

  for (const meals of mealGroups) {
    for (const meal of meals) {
      if (!meal.idMeal) continue

      const existing = mealsById.get(meal.idMeal)
      if (!existing) {
        mealsById.set(meal.idMeal, meal)
        continue
      }

      for (const field of ['strMeal', 'strMealThumb', 'strArea', 'strCategory', 'strTags']) {
        if (!existing[field] && meal[field]) existing[field] = meal[field]
      }
    }
  }

  return [...mealsById.values()]
}

async function getFilterMeals(type, value, signal) {
  const meals = await getMeals('filter.php', { [type]: value.replaceAll(' ', '_') }, signal)

  return meals.map((meal) => ({
    ...meal,
    ...(type === 'a' ? { strArea: value } : {}),
    ...(type === 'c' ? { strCategory: value } : {}),
    ...(type === 'i' ? { strTags: value } : {}),
  }))
}

export async function searchTheMealDbRecipes({ query, cuisine, diet, signal }) {
  const nameMeals = await getMeals('search.php', { s: query }, signal)
  const queryFilters = query
    ? await Promise.all([
        getFilterMeals('a', query, signal),
        getFilterMeals('c', query, signal),
        getFilterMeals('i', query, signal),
      ])
    : []
  const queryMeals = mergeMeals([nameMeals, ...queryFilters])
  let cuisineMeals = []
  let categoryGroups = []

  if (cuisine && cuisine !== 'All cuisines') {
    cuisineMeals = await getFilterMeals('a', cuisine, signal)
  }

  if (diet === 'Vegan' || diet === 'Vegetarian') {
    const categoryNames = diet === 'Vegan' ? ['Vegan'] : ['Vegetarian', 'Vegan']
    categoryGroups = await Promise.all(
      categoryNames.map((category) => getFilterMeals('c', category, signal))
    )
  }

  let results = query
    ? queryMeals
    : mergeMeals([queryMeals, cuisineMeals, ...categoryGroups])

  if (cuisineMeals.length > 0) {
    const cuisineIds = new Set(cuisineMeals.map((meal) => meal.idMeal))
    results = results.filter((meal) => cuisineIds.has(meal.idMeal))
  }

  if (categoryGroups.length > 0) {
    const categoryIds = new Set(
      categoryGroups.flatMap((meals) => meals.map((meal) => meal.idMeal))
    )
    results = results.filter((meal) => categoryIds.has(meal.idMeal))
  }

  return results.map(mapMeal)
}

export async function getTheMealDbRecipeDetails({ recipeId, signal }) {
  const meals = await getMeals('lookup.php', { i: recipeId }, signal)

  if (meals.length === 0) {
    throw new Error('TheMealDB could not find this recipe.')
  }

  return mapMeal(meals[0])
}

export async function getTheMealDbAreas(signal) {
  const data = await getMeals('list.php', { a: 'list' }, signal)
  return [...new Set(data.map((area) => area.strArea).filter(Boolean))]
}
