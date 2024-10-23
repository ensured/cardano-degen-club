import { NextRequest, NextResponse } from "next/server"
import { RECIPIES_SEARCH_TIMEOUT_MS } from "@/utils/consts"
import { checkRateLimit, getClientIp } from "@/utils/rateLimiter"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const ip = getClientIp()
  if (!ip) {
    return NextResponse.json({
      success: false,
      message: "Client IP address not found",
    })
  }

  const searchParams = request.nextUrl
    ? new URL(request.url).searchParams
    : null

  // For paginated fetching without rate-limiting
  if (searchParams && searchParams.get("nextPage")) {
    const nextPageUrl = `${searchParams.get(
      "nextPage"
    )}&app_key=${searchParams.get("app_key")}&_cont=${searchParams.get(
      "_cont"
    )}&type=${searchParams.get("type")}&app_id=${searchParams.get("app_id")}`

    try {
      const response = await fetch(nextPageUrl)
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "An error occurred. Please try again later.",
      })
    }
  }

  // For regular fetching with rate-limiting
  const rateLimitCheck = await checkRateLimit(
    "fetchRecipes",
    ip,
    RECIPIES_SEARCH_TIMEOUT_MS
  )
  if (!rateLimitCheck.success) {
    return NextResponse.json({
      success: false,
      message: rateLimitCheck.message,
    })
  }

  try {
    const input = searchParams?.get("q")
    const url = `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
    const response = await fetch(url)

    if (response.status === 429) {
      return NextResponse.json({
        success: false,
        message: `API Usage limits are exceeded, try again later`,
      })
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "An error occurred. Please try again later.",
    })
  }
}
