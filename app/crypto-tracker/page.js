import Animation from "@/components/Animation"
import TradingViewChart from "@/components/TradingViewChart"
import ConvertAda from "../../components/ConvertAda"

export const metadata = {
  title: "Crypto Price Tracker | Real-time ADA & BTC Conversion",
  description: "Track cryptocurrency prices and convert between ADA, BTC, and USD in real-time. Live price charts and market data.",
  keywords: "crypto tracker, Cardano, ADA price, Bitcoin, BTC price, cryptocurrency converter, real-time prices",
  openGraph: {
    title: "Crypto Price Tracker | Real-time ADA & BTC Conversion",
    description: "Track cryptocurrency prices and convert between ADA, BTC, and USD in real-time.",
    type: "website",
  },
}

const Page = async () => {
  return (
    <Animation>
      <main className="mx-auto flex w-full max-w-full flex-col gap-6 p-4 lg:max-w-[90%]">
        <h1 className="sr-only">Cryptocurrency Price Tracker and Converter</h1>
        <ConvertAda />
        <TradingViewChart />
      </main>
    </Animation>
  )
}

export default Page
