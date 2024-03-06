
import TradingViewChart from "../../components/TradingViewChart"

import ConvertAda from "../../components/ConvertAda"

const page = () => {



  return (
    <div className="flex flex-col items-center justify-center px-2">
      <ConvertAda />

      <TradingViewChart />
    </div>
  )
}

export default page
