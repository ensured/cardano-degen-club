import Animation from "@/components/Animation"
import TradingViewChart from "@/components/TradingViewChart"

import ConvertAda from "../../components/ConvertAda"

export const metadata = {
  title: "Crypto Tracker",
}
const page = async () => {
  return (
    <Animation>
      <div className="flex flex-col">
        <ConvertAda />
        <TradingViewChart />
      </div>
    </Animation>
  )
}

export default page
