import { headers } from "next/headers"
// import { NextResponse } from "next/server"
import MemoryCache from "memory-cache"

const RECIPIES_FETCH_TIMEOUT_MS = 1000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // first check if there is a nextUrl searchParam if so fetch that instead.
  const nextPage = searchParams.get("nextPage")
  if (nextPage) {
    console.log(nextPage)
    const response = await fetch(nextPage)
    console.log(response.status, response)
    const data = await response.json()
    return Response.json({
      success: true,
      data,
    })
  }

  const forwardedFor = headers().get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null

  const now = Date.now()
  const cacheKey = `rateLimit-${ip}`
  // Check if the request is within the rate limit window
  const lastSubmission = MemoryCache.get(cacheKey)
  if (lastSubmission && now - lastSubmission < RECIPIES_FETCH_TIMEOUT_MS) {
    return Response.json({
      success: false,
      message: `Rate limit exceeded, please try again in ${Math.ceil(
        (RECIPIES_FETCH_TIMEOUT_MS - (now - lastSubmission)) / 1000
      )} seconds`,
    })
  }
  try {
    const input = searchParams.get("q")
    const url = `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
    const response = await fetch(url)
    if (response.status === 429) {
      return Response.json({
        success: false,
        message: `API Usage limits are exceeded, try again later`,
      })
    }
    const data = await response.json()
    return Response.json({
      success: true,
      data: data,
    })
  } catch (err) {
    return Response.json({
      success: false,
      message: "An error occurred. Please try again later.",
    })
  } finally {
    // Update last submission time in the cache
    const now = Date.now()
    MemoryCache.put(cacheKey, now, RECIPIES_FETCH_TIMEOUT_MS) // Cache for 1 minute
  }
}
