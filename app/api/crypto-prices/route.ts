import { NextResponse } from "next/server"

const PRICES_CONFIG = [
  { symbol: "BINANCE:ADAUSD", pair: "cardano", name: "ADA/USD" },
  { symbol: "GATEIO:IAGUSDT", pair: "iagon", name: "IAG/USDT" },
]

export async function GET() {
  const headers = {
    accept: "application/json",
    "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
  }
  try {
    const prices = await Promise.all(
      PRICES_CONFIG.map(async ({ symbol, pair, name }) => {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${pair}&vs_currencies=usd&include_24hr_change=true`,
          {
            headers,
            next: { revalidate: 120 },
          }
        )

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Error fetching symbol ${symbol}: ${response.statusText} - ${errorText}`
          )
        }

        const data = await response.json()

        // Extract the price and 24h change from the response
        const price: number | undefined = data[pair]?.usd
        const percentChange24h: string | undefined = data[pair]?.usd_24h_change
        return { symbol, name, price, percentChange24h } // Return price and percent change
      })
    )

    return NextResponse.json(prices, { status: 200 })
  } catch (error) {
    console.error("Error fetching prices:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch prices", details: errorMessage },
      { status: 500 }
    )
  }
}
