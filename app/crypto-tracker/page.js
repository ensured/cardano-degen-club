import TradingViewChart from "@/components/TradingViewChart"

import ConvertAda from "../../components/ConvertAda"

export const metadata = {
  title: "Crypto Tracker",
}
const page = async () => {
  return (
    <div className="flex flex-col">
      <ConvertAda />
      <TradingViewChart />
    </div>
  )
}

export default page
