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
          container_id: containerId,
          width: width - 20,
          height: "420",
        })
      })
    }

    script.onload = () => {
      initializeCharts()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [width]) // Now we only depend on width

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
        width: window.innerWidth - 10,
        height: window.innerHeight - 10,
        container_id: "fullscreen_chart",
      })
      document.getElementById("fullscreen_chart").style.accentColor =
        "rgba(255,255,255, 100)"
    }, 0)
  }

  const closeFullscreen = () => {
    setFullscreenChart(null)
  }

  return (
    <div className="space-r-2 inset-0 flex size-full flex-col space-y-4 rounded-md py-2">
      {[...Array(6).keys()].map((i) => {
        const chartId = [
          "tradingview_ada_usd",
          "tradingview_ada_btc",
          "tradingview_ada_eth",
          "tradingview_ada_dominance",
          "tradingview_btc_dominance",
          "tradingview_iag_usdt",
        ][i]
        return (
          <div
            key={chartId}
            className="relative grid size-full grid-cols-1 gap-4 "
          >
            <div id={chartId} className="relative size-full rounded-md" />
            <button
              onClick={() => openFullscreen(chartId)}
              className="bg-blue-500 absolute right-11 top-[0.222rem] rounded bg-[#00000069] px-2 py-1 text-white"
            >
              <EnterFullScreenIcon className="size-6" />
            </button>
          </div>
        )
      })}
      {fullscreenChart && (
        // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75 pb-4">
          <div className=" rounded-lg p-4">
            <button
              onClick={closeFullscreen}
              className="absolute right-11 top-[-0.54rem] z-50 rounded bg-red-700/30 px-2 py-1 text-white"
            >
              <X className="size-7" />
            </button>
            <div id="fullscreen_chart" className="size-full rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingViewWidget
