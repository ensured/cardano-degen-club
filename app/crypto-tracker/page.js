import ConvertAda from "../../components/ConvertAda"
import TradingViewChart from "../../components/TradingViewChart"

const page = () => {
  return (
    <div className="flex flex-col">
      <ConvertAda />

      <TradingViewChart />
    </div>
  )
}

export default page
