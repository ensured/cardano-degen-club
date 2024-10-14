"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useWindowSize } from "@uidotdev/usehooks"

import iagLogo from "/public/iag_logo.png"

function TradingViewWidget() {
  const { width } = useWindowSize() // Get window dimensions dynamically

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // Create charts as before...
      new window.TradingView.widget({
        symbol: "BINANCE:ADABTC",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_ada_btc",
      })

      new window.TradingView.widget({
        symbol: "BINANCE:ADAETH",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_ada_eth",
      })

      new window.TradingView.widget({
        symbol: "BINANCE:ADAUSD",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_ada_usd",
      })

      new window.TradingView.widget({
        symbol: "CRYPTOCAP:ADA.D",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_ada_dominance",
      })

      new window.TradingView.widget({
        symbol: "CRYPTOCAP:BTC.D",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_btc_dominance",
      })

      new window.TradingView.widget({
        symbol: "GATEIO:IAGUSDT",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: "tradingview_iag_usdt",
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [width]) // Dynamically adjust the size when the window resizes

  return (
    <div className="space-r-2 inset-0 flex size-full flex-col space-y-4 rounded-md py-2">
      {[
        "tradingview_ada_btc",
        "tradingview_ada_eth",
        "tradingview_ada_usd",
        "tradingview_ada_dominance",
        "tradingview_btc_dominance",
        "tradingview_iag_usdt",
      ].map((chartId) => (
        <div key={chartId} className="relative h-[400px] w-full">
          <div id={chartId} className="size-full rounded-md" />
          {/* Overlay */}
          <div className={`absolute  mx-2.5 rounded-md transition-opacity`}>
            {chartId === "tradingview_iag_usdt" && (
              <div className="flex h-full items-center justify-center">
                <Image
                  src={iagLogo}
                  alt="IAG Logo"
                  className="size-40 rounded-lg" // Adjust width and height as needed
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TradingViewWidget
