import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      process.env.COIN_GECKO_API_URL ||
        "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd",
      {
        next: {
          revalidate: 30,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`)
    }

    const data = await response.json()
    const res = NextResponse.json(data)

    // Add cache control headers
    res.headers.append(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=29"
    )

    // Add CORS headers
    res.headers.append("Access-Control-Allow-Origin", "*") // Allow all origins

    return res
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message },
      { status: 500 }
    )
  }
}
