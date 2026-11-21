# Savor — Random Meal Generator

A frontend-only recipe discovery app built with Vue 3 and Vite. Find a meal by keyword, cuisine, or dietary preference, explore its recipe, and use your likes to shape future suggestions.

## Live app

The app is hosted on Netlify: `https://random-meal-generator-andres-orozco.netlify.app`

## Run locally

1. Open a terminal in this project folder.
2. Install the project dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

To create a production build, run `npm run build`. To preview that build locally, run `npm run preview`.

## Features

- Search TheMealDB by meal name, cuisine/area, category, or ingredient. Combine a keyword with the cuisine and dietary filters.
- Cuisine options are loaded from TheMealDB. Vegan and vegetarian preferences use its recipe categories.
- TheMealDB does not provide a reliable gluten-free filter. Choosing **Gluten-free** switches to the built-in sample recipes; check every ingredient before cooking.
- Open **See the recipe** to load full recipe details, including measured ingredients and step-by-step instructions. The details include a link to the recipe on TheMealDB.
- Recipe photos load from TheMealDB. If a photo is unavailable, the app displays a local placeholder image.
- If recipe search fails, the app displays an error and suggests matching built-in sample recipes instead.
- Choose **Love it** to save a recipe in **Your likes**. Likes influence future picks based on shared recipe tags and cuisine.
- Choose **Not for me** to exclude that recipe from future suggestions, or **Show me another** to skip it.
- **Start fresh** clears skipped and disliked recipes while keeping your likes.

## Recipe data and privacy

The app requests recipe data directly from [TheMealDB](https://www.themealdb.com/) using its educational API key `1`; no account or private API key is required. The app is frontend-only and has no backend, account, or database. Search filters, likes, dislikes, and suggestions are held in browser memory and reset when the page is reloaded.

The footer credits TheMealDB for recipe data and images. An internet connection is needed to search TheMealDB and load its recipe photos.
