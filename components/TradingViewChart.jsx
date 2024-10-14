"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons"
import { useWindowSize } from "@uidotdev/usehooks"
import { X } from "lucide-react"

import iagLogo from "/public/iag_logo.png"

function TradingViewWidget() {
  const { width } = useWindowSize() // Get window dimensions dynamically
  const [activeChart, setActiveChart] = useState(null) // State to track the active chart
  const [fullscreenChart, setFullscreenChart] = useState(null) // State to track fullscreen chart

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      initializeCharts()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [width]) // Dynamically adjust the size when the window resizes

  const initializeCharts = () => {
    const charts = [
      { symbol: "BINANCE:ADABTC", containerId: "tradingview_ada_btc" },
      { symbol: "BINANCE:ADAETH", containerId: "tradingview_ada_eth" },
      { symbol: "BINANCE:ADAUSD", containerId: "tradingview_ada_usd" },
      { symbol: "CRYPTOCAP:ADA.D", containerId: "tradingview_ada_dominance" },
      { symbol: "CRYPTOCAP:BTC.D", containerId: "tradingview_btc_dominance" },
      { symbol: "GATEIO:IAGUSDT", containerId: "tradingview_iag_usdt" },
    ]

    charts.forEach(({ symbol, containerId }) => {
      new window.TradingView.widget({
        symbol: symbol,
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: width - 20,
        height: "400",
        container_id: containerId,
      })
    })
  }

  const handleChartClick = (chartId) => {
    // Toggle the active chart
    setActiveChart((prev) => (prev === chartId ? null : chartId))
  }

  const openFullscreen = (chartId) => {
    setFullscreenChart(chartId)
    // Reinitialize the chart in the fullscreen modal
    setTimeout(() => {
      new window.TradingView.widget({
        symbol:
          chartId === "tradingview_ada_btc"
            ? "BINANCE:ADABTC"
            : chartId === "tradingview_ada_eth"
            ? "BINANCE:ADAETH"
            : chartId === "tradingview_ada_usd"
            ? "BINANCE:ADAUSD"
            : chartId === "tradingview_ada_dominance"
            ? "CRYPTOCAP:ADA.D"
            : chartId === "tradingview_btc_dominance"
            ? "CRYPTOCAP:BTC.D"
            : "GATEIO:IAGUSDT",
        interval: "D",
        theme: "dark",
        style: "1",
        locale: "en",
        width: window.innerWidth,
        height: window.innerHeight,
        container_id: "fullscreen_chart",
      })
    }, 0)
  }

  const closeFullscreen = () => {
    setFullscreenChart(null)
  }

  return (
    <div className="space-r-2 inset-0 flex size-full flex-col space-y-4 rounded-md py-2">
      {[...Array(6).keys()].map((i) => {
        const chartId = [
          "tradingview_ada_btc",
          "tradingview_ada_eth",
          "tradingview_ada_usd",
          "tradingview_ada_dominance",
          "tradingview_btc_dominance",
          "tradingview_iag_usdt",
        ][i]
        return (
          <div key={chartId} className="relative h-[400px] w-full">
            <div id={chartId} className="size-full rounded-md" />
            <button
              onClick={() => openFullscreen(chartId)}
              className="absolute top-[0.222rem] right-11 bg-blue-500 text-white px-2 py-1 rounded"
            >
              <EnterFullScreenIcon className="size-6" />
            </button>
            {/* Overlay */}
            <div className={`absolute mx-2.5 rounded-md transition-opacity`}>
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
        )
      })}
      {fullscreenChart && (
        <div className="fixed inset-0 w-screen flex items-center justify-center bg-black bg-opacity-75 z-40">
          <div className=" rounded-lg p-4">
            <button
              onClick={closeFullscreen}
              className="absolute -top-1.5 right-11 bg-red-700/30 text-white px-2 py-1 rounded z-50"
            >
              <X className="size-7" />
            </button>
            <div id="fullscreen_chart" className="w-full h-full rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingViewWidget
