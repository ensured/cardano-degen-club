import { NextResponse } from "next/server";
import { handleError } from "@/app/utils/errorHandler";

const PRICES_CONFIG = [
  { symbol: "BINANCE:ADAUSD", pair: "cardano", name: "ADA/USD" },
  { symbol: "GATEIO:IAGUSDT", pair: "iagon", name: "IAG/USDT" },
  { symbol: "BINANCE:BTCUSDT", pair: "bitcoin", name: "BTC/USDT" },
];

const headers = {
  accept: "application/json",
  "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
};

const fetchAdabtcPrice = async () => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=btc&include_24hr_change=true`,
      { headers, next: { revalidate: 60 } },
    );

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error fetching ADA/BTC price: ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching ADA/BTC price:", error);
  }
};

let cachedPrices: any = null; // Cache for prices
let lastFetchTime: number = 0; // Timestamp of the last fetch

export async function GET() {
  const currentTime = Date.now();

  // Check if we should fetch new data (30 seconds)
  if (!cachedPrices || currentTime - lastFetchTime > 30000) {
    try {
      const prices = await Promise.all(
        PRICES_CONFIG.map(async ({ symbol, pair, name }) => {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${pair}&vs_currencies=usd&include_24hr_change=true`,
            {
              headers,
              next: { revalidate: 60 },
            },
          );

          // check for status 429
          if (response.status === 429) {
            throw new Error("Too many requests");
          }

          // Check if the response is OK
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching symbol ${symbol}: ${errorText}`);
          }

          const data = await response.json();

          // Extract the price and 24h change from the response
          const price: number | undefined = data[pair]?.usd;
          const percentChange24h: string | undefined =
            data[pair]?.usd_24h_change;
          return { symbol, name, price, percentChange24h }; // Return price and percent change
        }),
      );

      const adaBtcPriceData = await fetchAdabtcPrice();

      // Update cache
      cachedPrices = { prices, adaBtcPriceData };
      lastFetchTime = currentTime; // Update last fetch time

      return NextResponse.json(cachedPrices, { status: 200 });
    } catch (error) {
      const { message, status } = handleError(error);
      return NextResponse.json({ error: message }, { status });
    }
  }

  // Return cached prices if within 30 seconds
  return NextResponse.json(cachedPrices, { status: 200 });
}

const fetchAdaDominance = async () => {};

const fetchBtcDominance = async () => {};
