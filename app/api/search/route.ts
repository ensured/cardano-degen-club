import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import MemoryCache from "memory-cache"

export const runtime = "edge"

const RECIPIES_FETCH_TIMEOUT_MS = 1000
const RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS = 200

const getUserIP = async () => {
  const ip = headers().get("x-forwarded-for")
  return ip
}

export async function GET(request: NextRequest) {
  const forwardedFor = await getUserIP()
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null
  const cacheKey = `rateLimit-${ip}`

  const searchParams = request.nextUrl
    ? new URL(request.url).searchParams
    : null

  if (searchParams && searchParams.get("nextPage")) {
    const NextPageUrl = `${searchParams.get(
      "nextPage"
    )}&app_key=${searchParams.get("app_key")}&_cont=${searchParams.get(
      "_cont"
    )}&type=${searchParams.get("type")}&app_id=${searchParams.get("app_id")}`

    try {
      const now = Date.now()
      const lastSubmission = MemoryCache.get(cacheKey)
      if (
        lastSubmission &&
        now - lastSubmission < RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS
      ) {
        const remainingTime =
          RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS - (now - lastSubmission)
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }
      const response = await fetch(NextPageUrl)
      const data = await response.json()
      MemoryCache.put(
        cacheKey,
        Date.now(),
        RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS
      )
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "An error occurred. Please try again later.",
      })
    }
  }

  try {
    const now = Date.now()
    const lastSubmission = MemoryCache.get(cacheKey)
    if (lastSubmission && now - lastSubmission < RECIPIES_FETCH_TIMEOUT_MS) {
      const remainingTime = RECIPIES_FETCH_TIMEOUT_MS - (now - lastSubmission)
      await new Promise((resolve) => setTimeout(resolve, remainingTime))
    }
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
    MemoryCache.put(cacheKey, Date.now(), RECIPIES_FETCH_TIMEOUT_MS) // Cache for 1 minute
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
