import PrismData from "@/components/PrismData"
import Tabz from "@/components/Tabz"

import "app/prism.css"

const Page = () => {
  const howTo = (
    <div className="container mx-auto px-2 py-4 text-sm">
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

  return (
    <>
      <Tabz source={<PrismData />} howTo={howTo} />
    </>
  )
}

export default Page
