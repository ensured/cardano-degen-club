import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export const runtime = "edge"

const CACHE_DURATION = 10000 // 10 seconds
type CachedData = {
  [key: string]: {
    usd: number
  }
}

let cachedData: CachedData | null = null
let lastFetchTime = 0

export async function GET(request: NextRequest) {
  const currentTime = Date.now()

  // Check if cached data is still valid
  if (cachedData && currentTime - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedData)
  }

  try {
    const response = await fetch(
      process.env.COIN_GECKO_API_URL ||
        "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
    )

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`)
    }

    const data: CachedData = await response.json()

    // Update cache
    cachedData = data
    lastFetchTime = currentTime

    // Set a cookie with the fetched price
    const cookie = `adaPrice=${JSON.stringify(data)}; Max-Age=10; Path=/; HttpOnly`
    const res = NextResponse.json(data)
    res.headers.append("Set-Cookie", cookie)

    // Add cache control headers
    res.headers.append(
      "Cache-Control",
      "s-maxage=10, stale-while-revalidate=59"
    )

    return res
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message },
      { status: 500 }
    )
  }
}
