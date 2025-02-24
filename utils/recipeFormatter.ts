export const formatRecipeForDownload = (recipe: any, format: 'txt' | 'md' = 'txt') => {
  const separator = format === 'md' ? '\n\n' : '\n\n'

  const content = [
    `# ${recipe.label}`,
    '## Recipe Information',
    `- Time: ${recipe.totalTime ? `${recipe.totalTime} mins` : 'N/A'}`,
    `- Servings: ${recipe.yield}`,
    `- Calories: ${Math.round(recipe.calories)} cal`,
    recipe.cuisineType ? `- Cuisine: ${recipe.cuisineType}` : '',
    recipe.mealType ? `- Meal Type: ${recipe.mealType}` : '',

    '## Ingredients',
    ...recipe.ingredientLines.map((line) => `- ${line}`),

    '## Nutritional Information',
    ...Object.entries(recipe.totalNutrients).map(
      ([_, value]: [string, any]) => `- ${value.label}: ${Math.round(value.quantity)}${value.unit}`,
    ),

    recipe.healthLabels?.length
      ? ['## Health Labels', ...recipe.healthLabels.map((label) => `- ${label}`)].join('\n')
      : '',

    recipe.dietLabels?.length
      ? ['## Diet Labels', ...recipe.dietLabels.map((label) => `- ${label}`)].join('\n')
      : '',

    `\nRecipe URL: ${recipe.shareAs}`,
    '\nDownloaded from Recipe Fren',
  ]
    .filter(Boolean)
    .join(separator)

  return content
}
