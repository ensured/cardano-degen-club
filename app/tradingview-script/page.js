import PrismData from "@/components/PrismData"
import Tabz from "@/components/Tabz"

import "./prism.css"
import Link from "next/link"

import Animation from "@/components/Animation"

export const metadata = {
  title: "TradingView Script",
}

const Page = () => {
  const howTo = (
    <div className="px-2">
      <p className="mb-2">
        <strong>How to use this script?</strong>
      </p>

      <div className="mb-2">
        <p>
          1. Open{" "}
          <Link
            href="https://www.tradingview.com/chart/?symbol=COINBASE%3AADAUSD"
            className="text-zinc-800 underline dark:hover:text-zinc-200"
          >
            TradingView chart
          </Link>
        </p>
        <p> 2. Open browser console (F12)</p>
      </div>
      <div className="mb-2">
        <p>3. Paste the code below into the console and press Enter</p>
      </div>
      <div className="mb-2">
        <p>4. Enjoy!</p>
      </div>
    </div>
  )

  return (
    <Animation>
      <Tabz source={<PrismData />} howTo={howTo} />
    </Animation>
  )
}

export default Page
