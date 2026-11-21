---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# AI Development Instructions

This application uses Vue 3, Vite, and JavaScript.

- Use Vue 3 Composition API.
- Keep code simple and beginner-friendly.
- Use JavaScript instead of TypeScript.
- Avoid unnecessary libraries and dependencies.
- Preserve existing functionality when making changes.
- Make the application responsive.
- Explain important code changes.
- Run npm run build to verify changes.
- Follow consistent naming conventions throughout the project.
- Use TheMealDB API to pull recipes and available meal images; use its educational API key `1` without adding private keys.
- Handle API errors gracefully.
- Ensure the application is accessible.
- Allow users to enter a search term like mexican, or burger, etc., to filter recipe results
- TheMealDB does not provide reliable gluten-free labels; do not claim API recipes are gluten-free unless explicitly tagged, and remind users to verify ingredients.
