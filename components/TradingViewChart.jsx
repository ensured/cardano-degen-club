"use client"

import { memo, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

function TradingViewWidget() {
  const { theme } = useTheme()
  const container = useRef()
  const [windowWidth, setWindowWidth] = useState(720)
  const [windowHeight, setWindowHeight] = useState(650)

  useEffect(() => {
    // Debounce function to limit the rate of execution
    const debounce = (func, delay) => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
      }
    }

    const loadChart = () => {
      // Check if the container is available
      if (!container.current) {
        return
      }

      // Remove the existing chart
      container.current.innerHTML = ""

      // Create a new script with the updated theme
      const script = document.createElement("script")
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
      script.type = "text/javascript"
      script.async = true
      script.innerHTML = `
        {
          "symbols": [
            ["BINANCE:ADAUSD|7D"],
            ["CRYPTOCAP:ADA.D|7D"],
            ["CRYPTOCAP:BTC.D|7D"],
            ["COINBASE:ADABTC|7D"],
            ["COINBASE:ADAETH|7D"]
          ],
          "chartOnly": false,
          "width": "100%",
          "height": "770",
          "locale": "en",
          "colorTheme": "${theme}",
          "autosize": true,
          "showVolume": true,
          "showMA": false,
          "hideDateRanges": false,
          "hideMarketStatus": false,
          "hideSymbolLogo": false,
          "scalePosition": "right",
          "scaleMode": "Normal",
          "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
          "fontSize": "${
            window.innerWidth < 600
              ? "12"
              : window.innerWidth < 700
              ? "14"
              : window.innerWidth < 800
              ? "18"
              : "20"
          }",
          "noTimeScale": true,
          "valuesTracking": "1",
          "changeMode": "price-and-percent",
          "chartType": "area",
          "maLineColor": "#2962FF",
          "maLineWidth": 1,
          "maLength": 9,
          "lineWidth": 2,
          "lineType": 0,
          "dateRanges": [
            "1d|1",
            "1m|30",
            "3m|60",
            "12m|1D",
            "60m|1W",
            "all|1M"
          ]
        }
      `

      // Append the new script to the container
      container.current.appendChild(script)
    }
    loadChart()
    const handleResize = debounce(() => {
      const newWidth = window.innerWidth

      // Check if the width has actually changed
      if (newWidth !== windowWidth) {
        setWindowWidth(newWidth)
        loadChart()
      }
    }, 300) // Adjust the delay as needed

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [theme, windowWidth])

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  )
}

export default memo(TradingViewWidget)
