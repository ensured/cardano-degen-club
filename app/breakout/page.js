"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import BreakoutGame from "@/components/BreakoutGame"

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const [data, setData] = useState({})

  // const fetchData = async () => {
  //   const response = await axios.get('wss://marketws.taptools.io/ws/v2/market/data', {
  //     headers: {
  //       'Pragma': 'no-cache',
  //       'Origin': 'https://www.taptools.io',
  //       'Accept-Language': 'en-US,en;q=0.9',
  //       'Sec-WebSocket-Key': 'kqyZbFfylAlQeNmJWANACA==',
  //       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  //       'Upgrade': 'websocket',
  //       'Cache-Control': 'no-cache',
  //       'Sec-GPC': '1',
  //       'Connection': 'Upgrade',
  //       'Sec-WebSocket-Version': '13',
  //       'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
  //     }
  //   });
  //   setData(response.data)
  // }

  // // eslint-disable-next-line react-hooks/rules-of-hooks
  // useEffect(() => {
  //   fetchData()
  // }, [])

  return (
    <div>
      <BreakoutGame />
    </div>
  )
}

export default page
