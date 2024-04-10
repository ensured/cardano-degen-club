import { NextRequest, NextResponse } from "next/server"
import { foodItems } from "lib/foods"

const getRandomFoodItem = async () => {
  const index = Math.floor(Math.random() * foodItems.length)
  return foodItems[index]
}

export async function GET(req: NextRequest, res: NextResponse) {
  const randomFood = await getRandomFoodItem()
  const response = await fetch(
    `https://api.edamam.com/api/food-database/v2/parser?ingr=${randomFood}&app_id=${process.env.FOOD_API_APP_ID}&app_key=${process.env.FOOD_API_APP_KEY}`
  )
  const data = await response.json()

  const food = data.hints[0].food.label // Return the label of the random food
  return NextResponse.json({
    food,
  })
}
