import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, res: NextResponse) {
  const response = await fetch(
    `https://api.edamam.com/api/food-database/v2/parser?ingr=random&app_id=${process.env.FOOD_API_APP_ID}&app_key=${process.env.FOOD_API_APP_KEY}`
  )
  const data = await response.json()
  // const randomFood = data.hints[0].food.label // Return the label of the random food
  console.log(data.hints)
  return NextResponse.json({
    data,
  })
}
