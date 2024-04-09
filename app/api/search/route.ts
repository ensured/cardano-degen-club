import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import MemoryCache from "memory-cache"

const RECIPIES_FETCH_TIMEOUT_MS = 1000
const RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS = 300

const getUserIP = async () => {
  const ip = headers().get("x-forwarded-for")
  return ip
}

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const forwardedFor = await getUserIP()
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null
  const cacheKey = `rateLimit-${ip}`

  const { searchParams } = new URL(request.url)
  if (searchParams.get("nextPage")) {
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
        console.log(`sleeping for remaining time: ${remainingTime + 1000}`)
        await new Promise((resolve) =>
          setTimeout(resolve, remainingTime + 1000)
        )
      }
      const response = await fetch(NextPageUrl)
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.log(error)
      return NextResponse.json({
        success: false,
        message: "An error occurred. Please try again later.",
      })
    } finally {
      MemoryCache.put(
        cacheKey,
        Date.now(),
        RECIPES_FETCH_NEW_PAGE_SLOWDOWN_TIMEOUT_MS
      )
    }
  }

  try {
    const input = searchParams.get("q")
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
  } finally {
    MemoryCache.put(cacheKey, Date.now(), RECIPIES_FETCH_TIMEOUT_MS) // Cache for 1 minute
  }
}
