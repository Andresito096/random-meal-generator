# Savor — Random Meal Generator

A frontend-only recipe discovery app built with Vue 3 and Vite. Choose a cuisine or dietary preference, explore one recipe at a time, and use your likes to guide future suggestions.

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

## How it works

- Filter suggestions by cuisine and dietary preference.
- Choose **See the recipe** to open the full ingredients and step-by-step instructions.
- Choose **Love it** to save a recipe in **Your likes** and influence future picks.
- Choose **Not for me** to exclude that recipe from future suggestions.
- Choose **Show me another** to move on without liking or disliking the current recipe.
- **Start fresh** resets skipped and disliked recipes while keeping your liked recipes.

All recipe data, likes, dislikes, and filters stay in the current browser session and reset when the page is reloaded; there is no backend, account, or database. Recipe photos and fonts load from external image and font services.
