import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const searchParams = req.nextUrl ? new URL(req.url).searchParams : null
    const query = searchParams?.get("q")
    const url = `https://api.edamam.com/auto-complete?q=${query}&app_id=${process.env.FOOD_API_APP_ID}&app_key=${process.env.FOOD_API_APP_KEY}`
    const data = await fetch(url).then((response) => response.json())
    return NextResponse.json({
      data,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}
