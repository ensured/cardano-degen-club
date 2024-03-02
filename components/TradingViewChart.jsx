"use client"

import { memo, useEffect, useRef, useState } from "react"

function TradingViewWidget() {
  const container = useRef()

  useEffect(() => {
    const script = document.createElement("script")

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = `
      {
        "symbols": [
          ["COINBASE:ADAUSD|1D"],
          ["CRYPTOCAP:BTC.D|1D"],
          ["COINBASE:ADABTC|1D"],
          ["COINBASE:ADAETH|1D"]
        ],
        "chartOnly": false,
        "width": "${Math.floor(window.innerHeight * 0.98)}",
        "height": "${Math.floor(window.innerHeight * 0.93)}",
        "locale": "en",
        "colorTheme": "dark",
        "autosize": false,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "12",
        "noTimeScale": false,
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
    container.current.appendChild(script)
  }, [])

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
