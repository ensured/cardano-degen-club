import ConvertAda from "../../components/ConvertAda"
import TradingViewChart from "../../components/TradingViewChart"

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <ConvertAda />

      <TradingViewChart />
    </div>
  )
}

export default page
