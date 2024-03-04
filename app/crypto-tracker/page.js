import TradingViewChart from "../../components/TradingViewChart"
import SwitchForm from "@/components/SwitchForm"
const page = () => {
  return (
    <div className="px-2 flex flex-col justify-center items-center">

      {/* <SwitchForm /> */}  {/* work on getting realtime price data and fix the converter. */}


      <TradingViewChart />
    </div>
  )
}

export default page
