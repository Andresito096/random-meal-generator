<script setup>
import { computed, ref, watch } from 'vue'
import { recipes } from './data/recipes.js'

const cuisineOptions = ['All cuisines', ...new Set(recipes.map((recipe) => recipe.cuisine))]
const dietaryOptions = ['Anything', 'Vegan', 'Vegetarian', 'Gluten-free']

const cuisineFilter = ref(cuisineOptions[0])
const dietaryFilter = ref(dietaryOptions[0])
const currentView = ref('discover')
const currentRecipe = ref(null)
const likedRecipes = ref([])
const dislikedIds = ref([])
const seenIds = ref([])
const detailsRecipe = ref(null)
const feedback = ref('')
const fallbackRecipeImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#e8eee7"/><stop offset="1" stop-color="#d4dfd0"/></linearGradient></defs><rect width="800" height="500" fill="url(#a)"/><circle cx="400" cy="235" r="130" fill="#fffefa" opacity=".8"/><circle cx="400" cy="235" r="98" fill="#d9e3d4"/><path d="M347 230c25-46 78-48 109-5-8 43-45 69-87 56-23-8-34-27-22-51Z" fill="#96ad84"/><circle cx="370" cy="222" r="13" fill="#cf8d67"/><circle cx="420" cy="253" r="12" fill="#d1a256"/><path d="M400 80v35m0 240v35M245 235h35m240 0h35" stroke="#77916f" stroke-width="8" stroke-linecap="round" opacity=".65"/></svg>'
)}`

const matchingRecipeCount = computed(() =>
  recipes.filter((recipe) => matchesPreferences(recipe)).length
)

const likedRecipeIds = computed(() => likedRecipes.value.map((recipe) => recipe.id))

const recommendationsLearned = computed(() =>
  likedRecipes.value.length > 0
    ? 'Your likes are shaping the next picks.'
    : 'Like a recipe and we’ll use it to shape your next picks.'
)

function matchesPreferences(recipe) {
  const matchesCuisine =
    cuisineFilter.value === 'All cuisines' || recipe.cuisine === cuisineFilter.value
  const matchesDiet =
    dietaryFilter.value === 'Anything' || recipe.dietary.includes(dietaryFilter.value)

  return matchesCuisine && matchesDiet
}

function getRecommendationScore(recipe) {
  const likedTags = likedRecipes.value.flatMap((likedRecipe) => likedRecipe.tags)
  const sharedTagScore = likedTags.filter((tag) => recipe.tags.includes(tag)).length
  const sharedCuisineScore = likedRecipes.value.filter(
    (likedRecipe) => likedRecipe.cuisine === recipe.cuisine
  ).length

  return sharedTagScore + sharedCuisineScore * 2
}

function pickNextRecipe() {
  const previousRecipe = currentRecipe.value

  if (previousRecipe && !seenIds.value.includes(previousRecipe.id)) {
    seenIds.value.push(previousRecipe.id)
  }

  const candidates = recipes.filter(
    (recipe) =>
      matchesPreferences(recipe) &&
      !dislikedIds.value.includes(recipe.id) &&
      !likedRecipeIds.value.includes(recipe.id) &&
      !seenIds.value.includes(recipe.id)
  )

  if (candidates.length === 0) {
    currentRecipe.value = null
    feedback.value = ''
    return
  }

  const highestScore = Math.max(...candidates.map(getRecommendationScore))
  const bestMatches = candidates.filter(
    (recipe) => getRecommendationScore(recipe) === highestScore
  )
  const nextIndex = Math.floor(Math.random() * bestMatches.length)

  currentRecipe.value = bestMatches[nextIndex]
  feedback.value = ''
}

function likeCurrentRecipe() {
  if (!currentRecipe.value) return

  const likedRecipe = currentRecipe.value
  likedRecipes.value = [...likedRecipes.value, likedRecipe]
  pickNextRecipe()
  feedback.value = `Added ${likedRecipe.name} to your liked recipes.`
}

function dislikeCurrentRecipe() {
  if (!currentRecipe.value) return

  const dislikedRecipe = currentRecipe.value
  dislikedIds.value.push(dislikedRecipe.id)
  pickNextRecipe()
  feedback.value = `${dislikedRecipe.name} won’t be suggested again.`
}

function resetSuggestions() {
  seenIds.value = []
  dislikedIds.value = []
  currentRecipe.value = null
  pickNextRecipe()
}

function removeLikedRecipe(recipeId) {
  likedRecipes.value = likedRecipes.value.filter((recipe) => recipe.id !== recipeId)
}

function openRecipeDetails(recipe) {
  detailsRecipe.value = recipe
}

function handleRecipeImageError(event) {
  const image = event.currentTarget
  image.onerror = null
  image.src = fallbackRecipeImage
}

function closeRecipeDetails() {
  detailsRecipe.value = null
}

watch([cuisineFilter, dietaryFilter], () => {
  seenIds.value = []
  currentRecipe.value = null
  pickNextRecipe()
})

pickNextRecipe()
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Savor home" @click.prevent="currentView = 'discover'">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M25.8 5.2C16 5.4 8.3 8.2 7.1 15.1c-.7 4.2 2.2 7.2 6 6.6 7.7-1.2 10.1-9.3 12.7-16.5Z" fill="currentColor" />
            <path d="M6 27c2.4-7.7 7-12.4 13.2-15.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </span>
        <span>savor<span class="brand-period">.</span></span>
      </a>

      <nav class="top-nav" aria-label="Main navigation">
        <button
          class="nav-link"
          :class="{ 'is-active': currentView === 'discover' }"
          type="button"
          @click="currentView = 'discover'"
        >
          Discover
        </button>
        <button
          class="nav-link saved-nav-link"
          :class="{ 'is-active': currentView === 'saved' }"
          type="button"
          @click="currentView = 'saved'"
        >
          Your likes <span class="nav-count">{{ likedRecipes.length }}</span>
        </button>
      </nav>

      <div class="header-note">
        <span class="status-dot"></span>
        A little inspiration, served fresh
      </div>
    </header>

    <main>
      <template v-if="currentView === 'discover'">
        <section class="page-intro">
          <div>
            <p class="eyebrow"><span class="eyebrow-line"></span> YOUR PERSONAL MEAL FINDER</p>
            <h1>Good food starts<br class="desktop-break" /> with <em>a little curiosity.</em></h1>
          </div>
          <p class="intro-copy">
            Tell us what sounds good. We’ll find a recipe worth looking forward to.
          </p>
        </section>

        <div class="content-grid">
          <section class="discover-column" aria-labelledby="today-heading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">THE DAILY DISH</p>
                <h2 id="today-heading">A pick for you</h2>
              </div>
              <span class="recipe-count">
                {{ currentRecipe ? `${seenIds.length + 1} / ${matchingRecipeCount}` : 'ALL CAUGHT UP' }}
              </span>
            </div>

            <article v-if="currentRecipe" class="recipe-card">
              <div class="recipe-photo-wrap">
                <img
                  :key="currentRecipe.id"
                  class="recipe-photo"
                  :src="currentRecipe.image"
                  :alt="currentRecipe.imageAlt"
                  fetchpriority="high"
                  @error="handleRecipeImageError"
                />
                <div class="photo-shade"></div>
                <span class="photo-label">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 1.5 9.7 6.3 14.5 8l-4.8 1.7L8 14.5l-1.7-4.8L1.5 8l4.8-1.7L8 1.5Z" fill="currentColor" />
                  </svg>
                  A fresh idea
                </span>
                <span class="photo-time">{{ currentRecipe.time }} min</span>
              </div>

              <div class="recipe-content">
                <div class="recipe-meta">
                  <span>{{ currentRecipe.cuisine }}</span>
                  <span class="meta-separator"></span>
                  <span>{{ currentRecipe.difficulty }}</span>
                  <span class="rating">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="m8 1 2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8l-4.2 2.2.8-4.7L1.2 6l4.7-.7L8 1Z" fill="currentColor" />
                    </svg>
                    {{ currentRecipe.rating }}
                  </span>
                </div>

                <h3>{{ currentRecipe.name }}</h3>
                <p class="recipe-description">{{ currentRecipe.description }}</p>

                <div class="tag-list" aria-label="Recipe tags">
                  <span v-for="tag in currentRecipe.dietary" :key="tag" class="diet-tag">{{ tag }}</span>
                  <span class="diet-tag">{{ currentRecipe.calories }} cal</span>
                </div>

                <div class="recipe-actions">
                  <button class="button button-primary" type="button" @click="openRecipeDetails(currentRecipe)">
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M3 4.5c2.4-1.2 4.8-1.2 7 0v12c-2.2-1.2-4.6-1.2-7 0v-12Zm14 0c-2.4-1.2-4.8-1.2-7 0v12c2.2-1.2 4.6-1.2 7 0v-12Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                    See the recipe
                  </button>
                  <button class="button button-like" type="button" @click="likeCurrentRecipe">
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 17s-7-4.2-7-9a3.8 3.8 0 0 1 7-2 3.8 3.8 0 0 1 7 2c0 4.8-7 9-7 9Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                    </svg>
                    Love it
                  </button>
                  <button class="icon-button dislike-button" type="button" aria-label="Not for me" @click="dislikeCurrentRecipe">
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
                <button class="next-link" type="button" @click="pickNextRecipe">
                  Not quite? Show me another
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </article>

            <div v-else class="empty-state">
              <span class="empty-illustration" aria-hidden="true">✳</span>
              <p class="eyebrow">THAT’S A WRAP</p>
              <h3>No new recipes for now.</h3>
              <p>Try changing your filters or start fresh to see more ideas.</p>
              <button class="button button-primary" type="button" @click="resetSuggestions">
                Start fresh
              </button>
            </div>

            <p class="feedback-message" aria-live="polite">{{ feedback }}</p>
          </section>

          <aside class="side-column">
            <section class="preferences-card" aria-labelledby="preferences-heading">
              <div class="side-card-heading">
                <span class="heading-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20">
                    <path d="M3 5h14M5.5 10h9M8 15h4M6 3.5v3M14 8.5v3M10 13.5v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </span>
                <div>
                  <h2 id="preferences-heading">Your kind of meal</h2>
                  <p>A few little preferences</p>
                </div>
              </div>

              <label class="filter-label" for="cuisine-filter">Cuisine</label>
              <div class="select-wrap">
                <select id="cuisine-filter" v-model="cuisineFilter">
                  <option v-for="cuisine in cuisineOptions" :key="cuisine" :value="cuisine">
                    {{ cuisine }}
                  </option>
                </select>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <label class="filter-label dietary-label" for="diet-filter">Dietary preference</label>
              <div class="select-wrap">
                <select id="diet-filter" v-model="dietaryFilter">
                  <option v-for="diet in dietaryOptions" :key="diet" :value="diet">
                    {{ diet }}
                  </option>
                </select>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <div class="preference-note">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 2.5a6.1 6.1 0 0 0-3.6 11v2h7.2v-2a6.1 6.1 0 0 0-3.6-11ZM7.9 18h4.2M10 5.5v4m-1.8-2.2L10 9l1.8-1.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>{{ recommendationsLearned }}</span>
              </div>
            </section>

            <section class="liked-card" aria-labelledby="liked-heading">
              <div class="liked-heading-row">
                <div>
                  <p class="eyebrow">THE KEEPERS</p>
                  <h2 id="liked-heading">Recipes you love</h2>
                </div>
                <button
                  v-if="likedRecipes.length"
                  class="text-link"
                  type="button"
                  @click="currentView = 'saved'"
                >
                  See all
                </button>
              </div>

              <div v-if="likedRecipes.length" class="liked-list">
                <article v-for="recipe in likedRecipes.slice(-3).reverse()" :key="recipe.id" class="liked-item">
                  <button class="liked-recipe-link" type="button" @click="openRecipeDetails(recipe)">
                    <img
                      :key="recipe.id"
                      :src="recipe.image"
                      :alt="recipe.imageAlt"
                      loading="lazy"
                      @error="handleRecipeImageError"
                    />
                    <span class="liked-item-copy">
                      <strong>{{ recipe.name }}</strong>
                      <small>{{ recipe.cuisine }} · {{ recipe.time }} min</small>
                    </span>
                  </button>
                  <button
                    class="remove-like"
                    type="button"
                    :aria-label="`Remove ${recipe.name} from your likes`"
                    @click="removeLikedRecipe(recipe.id)"
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="m4 4 8 8m0-8-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </button>
                </article>
              </div>
              <div v-else class="liked-empty">
                <span class="heart-outline" aria-hidden="true">♡</span>
                <p>Your favorite finds will live here.</p>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <section v-else class="saved-page" aria-labelledby="saved-heading">
        <button class="back-link" type="button" @click="currentView = 'discover'">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M16 10H4m5 5-5-5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Back to discovery
        </button>
        <div class="saved-page-heading">
          <p class="eyebrow">YOUR LITTLE RECIPE BOX</p>
          <h1 id="saved-heading">The ones you <em>love.</em></h1>
          <p>All the lovely meals you’ve saved for another day.</p>
        </div>

        <div v-if="likedRecipes.length" class="saved-grid">
          <article v-for="recipe in [...likedRecipes].reverse()" :key="recipe.id" class="saved-recipe-card">
            <button class="saved-image-button" type="button" @click="openRecipeDetails(recipe)">
              <img
                :key="recipe.id"
                :src="recipe.image"
                :alt="recipe.imageAlt"
                loading="lazy"
                @error="handleRecipeImageError"
              />
              <span class="saved-time">{{ recipe.time }} min</span>
            </button>
            <div class="saved-recipe-copy">
              <p class="recipe-meta">{{ recipe.cuisine }} <span class="meta-separator"></span> {{ recipe.difficulty }}</p>
              <h2>{{ recipe.name }}</h2>
              <p>{{ recipe.description }}</p>
              <div class="saved-card-actions">
                <button class="text-link" type="button" @click="openRecipeDetails(recipe)">View recipe</button>
                <button class="remove-saved" type="button" @click="removeLikedRecipe(recipe.id)">
                  Remove
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="saved-empty-state">
          <span class="empty-illustration" aria-hidden="true">♡</span>
          <h2>Nothing on the menu just yet.</h2>
          <p>When a recipe catches your eye, tap “Love it” and it’ll be waiting here.</p>
          <button class="button button-primary" type="button" @click="currentView = 'discover'">
            Find something delicious
          </button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <a class="footer-brand" href="#" @click.prevent="currentView = 'discover'">savor<span>.</span></a>
      <p>Made for good food and good days.</p>
      <span class="footer-built">A little inspiration, just for you</span>
    </footer>

    <Transition name="fade">
      <div
        v-if="detailsRecipe"
        class="modal-backdrop"
        role="presentation"
        @click.self="closeRecipeDetails"
        @keydown.esc.window="closeRecipeDetails"
      >
        <section
          class="recipe-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="`${detailsRecipe.name} recipe details`"
        >
          <button class="modal-close" type="button" aria-label="Close recipe details" @click="closeRecipeDetails">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </button>
          <div class="modal-photo-wrap">
            <img
              :key="detailsRecipe.id"
              :src="detailsRecipe.image"
              :alt="detailsRecipe.imageAlt"
              fetchpriority="high"
              @error="handleRecipeImageError"
            />
            <div class="modal-photo-shade"></div>
            <div class="modal-title">
              <p class="eyebrow">LET’S MAKE SOMETHING GOOD</p>
              <h2>{{ detailsRecipe.name }}</h2>
              <p>{{ detailsRecipe.description }}</p>
            </div>
          </div>
          <div class="modal-meta">
            <span><strong>{{ detailsRecipe.time }}</strong> min</span>
            <span><strong>{{ detailsRecipe.servings }}</strong> servings</span>
            <span><strong>{{ detailsRecipe.calories }}</strong> cal / serving</span>
            <span>{{ detailsRecipe.difficulty }}</span>
          </div>
          <div class="recipe-details-body">
            <section class="ingredients-section" aria-labelledby="ingredients-heading">
              <p class="eyebrow">GET YOUR INGREDIENTS</p>
              <h3 id="ingredients-heading">What you’ll need</h3>
              <ul class="ingredient-list">
                <li v-for="(ingredient, index) in detailsRecipe.ingredients" :key="`${detailsRecipe.id}-ingredient-${index}`">
                  <span class="ingredient-check" aria-hidden="true"></span>
                  {{ ingredient }}
                </li>
              </ul>
            </section>
            <section class="steps-section" aria-labelledby="steps-heading">
              <p class="eyebrow">A FEW SIMPLE STEPS</p>
              <h3 id="steps-heading">Let’s get cooking</h3>
              <ol class="step-list">
                <li v-for="(step, index) in detailsRecipe.steps" :key="`${detailsRecipe.id}-step-${index}`">
                  <span class="step-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <p>{{ step }}</p>
                </li>
              </ol>
            </section>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
