import Image from "next/image"
import Link from "next/link"

import ConvertAda from "../../components/ConvertAda"
import TradingViewChart from "../../components/TradingViewChart"
import iagLogo from "/public/iag_logo.png"

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
