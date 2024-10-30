import Animation from "@/components/Animation"
import TradingViewChart from "@/components/TradingViewChart"

import ConvertAda from "../../components/ConvertAda"

export const metadata = {
  title: "Crypto Tracker",
  description: "Track and convert cryptocurrency prices in real-time",
}

const Page = async () => {
  return (
    <Animation>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
        <ConvertAda />
        <TradingViewChart />
      </div>
    </Animation>
  )
}

export default Page
