import Image from "next/image"
import Link from "next/link"
import axios from "axios"

import ConvertAda from "../../components/ConvertAda"
import TradingViewChart from "../../components/TradingViewChart"
import iagLogo from "/public/iag_logo.png"

export const metadata = {
  title: "Crypto Tracker",
}
const page = async () => {
  const response = await axios.get(
    "https://www.taptools.io/_next/data/OBYsv5Ua_IEiYGIvCI_rz/charts/token/iag.json",
    {
      params: {
        pairID: "iag",
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.7",
        cookie: "currency=ADA",
        priority: "u=1, i",
        referer: "https://www.taptools.io/?currency=ADA",
        "sec-ch-ua": '"Brave";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "x-nextjs-data": "1",
      },
    }
  )
  if (response.statusCode !== 200 && response.statusCode !== undefined) {
    throw new Error(`Failed to fetch data: ${response.status}`)
  }
  const data = response.data.pageProps
  const price = data.pair.price
  const priceString = JSON.stringify(price).slice(0, 8)
  return (
    <div className="flex flex-col">
      <div
        id="grid-container"
        className="grid place-items-center gap-4 px-6 pt-12 sm:grid-cols-1"
      >
        <Link href="https://www.taptools.io/charts/token/iag">
          <div
            className={`flex items-center gap-2 rounded-md border-2 border-gray-700 p-4 dark:border-gray-300 ${
              priceString
                ? "bg-purple-500 text-black dark:bg-purple-500"
                : "bg-green-100 "
            }`}
          >
            <Image
              src={iagLogo}
              width={40}
              height={40}
              alt="IAG Logo"
              className="rounded-full"
            />

            <h1 className="text-zinc-90 py-4 text-2xl font-bold dark:text-zinc-50">
              {priceString}₳
            </h1>
          </div>
        </Link>
      </div>

      <ConvertAda />
      <TradingViewChart />
    </div>
  )
}

export default page
