interface ParsedIngredient {
  quantity: number | null
  unit: string | null
  ingredient: string
}

const commonUnits = [
  // Standard volume measurements
  'cup',
  'cups',
  'c',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'tbs',
  'T',
  'teaspoon',
  'teaspoons',
  'tsp',
  't',
  'fluid ounce',
  'fluid ounces',
  'fl oz',
  'milliliter',
  'milliliters',
  'ml',
  'liter',
  'liters',
  'l',
  'gallon',
  'gallons',
  'gal',
  'quart',
  'quarts',
  'qt',
  'pint',
  'pints',
  'pt',

  // Weight measurements
  'pound',
  'pounds',
  'lb',
  'lbs',
  'ounce',
  'ounces',
  'oz',
  'gram',
  'grams',
  'g',
  'kilogram',
  'kilograms',
  'kg',

  // Common cooking units
  'pinch',
  'pinches',
  'dash',
  'dashes',
  'handful',
  'handfuls',
  'piece',
  'pieces',
  'slice',
  'slices',
  'can',
  'cans',
  'package',
  'packages',
  'pkg',
  'bunch',
  'bunches',
  'stick',
  'sticks',
  'clove',
  'cloves',
]

const fractionToDecimal = (fraction: string): number => {
  // Handle unicode fractions
  const unicodeFractions: { [key: string]: number } = {
    '½': 1 / 2,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '¼': 1 / 4,
    '¾': 3 / 4,
    '⅕': 1 / 5,
    '⅖': 2 / 5,
    '⅗': 3 / 5,
    '⅘': 4 / 5,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅐': 1 / 7,
    '⅛': 1 / 8,
    '⅜': 3 / 8,
    '⅝': 5 / 8,
    '⅞': 7 / 8,
    '⅑': 1 / 9,
    '⅒': 1 / 10,
  }

  if (unicodeFractions[fraction]) {
    return unicodeFractions[fraction]
  }

  if (fraction.includes('/')) {
    const [num, denom] = fraction.split('/')
    return Number(num) / Number(denom)
  }
  return Number(fraction)
}

export const parseIngredient = (ingredientString: string): ParsedIngredient => {
  // Handle ranges like "1-2" or "1 to 2" by taking the average
  if (ingredientString.includes(' to ') || ingredientString.includes('-')) {
    const parts = ingredientString.replace('-', ' to ').split(' to ')
    if (parts.length === 2) {
      const first = parseIngredient(parts[0])
      const second = parseIngredient(parts[1])
      if (first.quantity && second.quantity) {
        first.quantity = (first.quantity + second.quantity) / 2
        return first
      }
    }
  }

  // Match quantity patterns including unicode fractions
  const quantityPattern = /^(\d*\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]|\d+(\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)\s*/
  const quantityMatch = ingredientString.match(quantityPattern)

  let quantity: number | null = null
  let remainingString = ingredientString

  if (quantityMatch) {
    const quantityStr = quantityMatch[0].trim()
    if (quantityStr.includes(' ')) {
      // Handle mixed numbers like "1 1/2"
      const [whole, fraction] = quantityStr.split(/\s+/)
      quantity = Number(whole) + fractionToDecimal(fraction)
    } else {
      quantity = fractionToDecimal(quantityStr)
    }
    remainingString = ingredientString.slice(quantityMatch[0].length).trim()
  }

  // Look for units, including variations with spaces and parentheses
  const unitPattern = new RegExp(`^(${commonUnits.join('|')})(\\s+|\\s*\\(.*?\\)\\s*)`, 'i')
  const unitMatch = remainingString.match(unitPattern)

  let unit: string | null = null
  let ingredient = remainingString

  if (unitMatch) {
    unit = unitMatch[1].toLowerCase()
    ingredient = remainingString.slice(unitMatch[0].length).trim()
  }

  // Clean up any extra spaces or parentheses
  ingredient = ingredient.replace(/\s+/g, ' ').trim()

  return {
    quantity,
    unit,
    ingredient,
  }
}
