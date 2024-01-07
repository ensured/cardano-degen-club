import PrismData from "@/components/PrismData"
import Tabz from "@/components/Tabz"

import "./prism.css"

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
        <p>1. Open TradingView chart </p>
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

  return <Tabz source={<PrismData />} howTo={howTo} />
}

export default Page
