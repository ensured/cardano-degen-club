import ConvertAda from "../../components/ConvertAda"
import TradingViewChart from "../../components/TradingViewChart"

export const metadata = {
  title: "Crypto Tracker",
}
const page = () => {
  return (
    <div className="flex flex-col">
      <ConvertAda />

      <TradingViewChart />
    </div>
  )
}

export default page
