/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  ReloadIcon,
  MinusIcon,
} from "@radix-ui/react-icons"
import { Button } from "./ui/button"
import { ChevronDown, CopyIcon, InfoIcon, Loader2 } from "lucide-react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import ConvertAda from "./ConvertAda"
import { getAddressFromHandle } from "@/app/actions"
import { Input } from "./ui/input"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CHART_CONFIG = [
  {
    symbol: "BINANCE:ADAUSD",
    containerId: "tradingview_ada_usd",
    title: "ADA/USD",
  },
  {
    symbol: "GATEIO:IAGUSDT",
    containerId: "tradingview_iag_usdt",
    title: "IAG/USDT",
  },
  {
    symbol: "BINANCE:ADABTC",
    containerId: "tradingview_ada_btc",
    title: "ADA/BTC",
  },
  {
    symbol: "CRYPTOCAP:ADA.D",
    containerId: "tradingview_ada_dominance",
    title: "ADA.D",
  },
  {
    symbol: "CRYPTOCAP:BTC.D",
    containerId: "tradingview_btc_dominance",
    title: "BTC.D",
  },
  {
    symbol: "BINANCE:ADAETH",
    containerId: "tradingview_ada_eth",
    title: "ADA/ETH",
  },
]

// Add chart intervals and themes configuration
const INTERVALS = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
]

// Update the INDICATORS constant
const INDICATORS = [
  { label: "MACD", value: "MACD@tv-basicstudies" },
  { label: "RSI", value: "RSI@tv-basicstudies" },
  { label: "Volume", value: "Volume@tv-basicstudies" },
  { label: "MA 20", value: "MA@tv-basicstudies,20" },
]

function TradingViewChart() {
  const [fullscreenChart, setFullscreenChart] = useState(null)
  const [chartSettings, setChartSettings] = useState(
    CHART_CONFIG.reduce(
      (acc, { containerId }) => ({
        ...acc,
        [containerId]: {
          interval: "D",
          theme: "dark",
          indicators: [],
        },
      }),
      {}
    )
  )
  const [activeChart, setActiveChart] = useState(CHART_CONFIG[0].containerId)
  const [prices, setPrices] = useState([])
  const [adaBtcPriceData, setAdaBtcPriceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [handleName, setHandleName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [showInfo, setShowInfo] = useState(false)

  // Add a ref to track mounted charts
  const chartInstancesRef = useRef({})

  // Add a ref to track the last updated chart
  const lastUpdatedChartRef = useRef(null)

  // Add chart controls component

  // Update initializeChart to only depend on the specific chart's settings
  const initializeChart = useCallback(
    (containerId) => {
      if (typeof window === "undefined") return // Check if running in the browser

      const config = CHART_CONFIG.find((c) => c.containerId === containerId)
      if (!config || !document.getElementById(containerId)) return

      const settings = chartSettings[containerId]

      // Clean up existing chart instance if it exists
      if (chartInstancesRef.current[containerId]) {
        try {
          chartInstancesRef.current[containerId].remove()
        } catch (error) {
          console.log("Chart cleanup failed:", error)
        }
        delete chartInstancesRef.current[containerId]
      }

      // Create new chart instance
      chartInstancesRef.current[containerId] = new window.TradingView.widget({
        symbol: config.symbol,
        interval: settings.interval,
        theme: settings.theme,
        style: "1",
        locale: "en",
        container_id: containerId,
        width: "100%",
        height: "460",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: settings.indicators,
        drawings_access: { type: "all", tools: [{ name: "Regression Trend" }] },
      })
    },
    [chartSettings]
  )

  // Update useEffect to initialize charts
  useEffect(() => {
    if (typeof window === "undefined") return // Check if running in the browser

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      initializeChart(activeChart)
    }

    return () => {
      // Cleanup chart instances
      if (chartInstancesRef.current[activeChart]) {
        try {
          if (chartInstancesRef.current[activeChart].remove) {
            chartInstancesRef.current[activeChart].remove()
          }
        } catch (error) {
          console.log("Chart cleanup failed:", error)
        }
        delete chartInstancesRef.current[activeChart]
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [activeChart, initializeChart])

  // Update the chart settings handler
  const updateChartSetting = useCallback(
    (containerId, updates) => {
      lastUpdatedChartRef.current = containerId
      setChartSettings((prev) => ({
        ...prev,
        [containerId]: {
          ...prev[containerId],
          ...updates,
        },
      }))
      // Initialize only the specific chart after a short delay
      setTimeout(() => initializeChart(containerId), 0)
    },
    [initializeChart]
  )

  // Update the reinitializeChart function to ensure proper cleanup and initialization
  const reinitializeChart = (containerId, settings) => {
    if (!document.getElementById(containerId)) return

    const config = CHART_CONFIG.find(
      (c) =>
        c.containerId ===
        (containerId === "fullscreen_chart" ? fullscreenChart : containerId)
    )
    if (!config) return

    // Clean up existing chart instance
    if (chartInstancesRef.current[containerId]) {
      try {
        chartInstancesRef.current[containerId].remove()
      } catch (error) {
        console.log("Chart cleanup failed:", error)
      }
      delete chartInstancesRef.current[containerId]
    }

    // Wait for DOM to be ready
    setTimeout(() => {
      if (!document.getElementById(containerId)) return

      // Create new chart instance
      chartInstancesRef.current[containerId] = new window.TradingView.widget({
        symbol: config.symbol,
        interval: settings.interval,
        theme: settings.theme,
        style: "1",
        locale: "en",
        container_id: containerId,
        width: "100%",
        height:
          containerId === "fullscreen_chart" && typeof window !== "undefined"
            ? window.innerHeight - 64
            : "460",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: settings.indicators,
        drawings_access: { type: "all", tools: [{ name: "Regression Trend" }] },
        autosize: true,
      })
    }, 50)

    updateChartSetting(containerId, settings)
  }

  // Update FullscreenChartControls component
  const FullscreenChartControls = ({ onClose }) => (
    <div className="absolute inset-x-0 -top-2 z-10">
      <div className="flex items-center justify-between overflow-x-auto bg-black/30 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Add chart selector dropdown */}
          <div className="relative">
            <select
              value={fullscreenChart}
              onChange={(e) => {
                const newChartId = e.target.value
                setFullscreenChart(newChartId)
                // Reinitialize with the new chart
                setTimeout(() => {
                  const config = CHART_CONFIG.find(
                    (c) => c.containerId === newChartId
                  )
                  if (!config) return

                  if (chartInstancesRef.current["fullscreen_chart"]) {
                    try {
                      chartInstancesRef.current["fullscreen_chart"].remove()
                    } catch (error) {
                      console.log("Chart cleanup failed:", error)
                    }
                    delete chartInstancesRef.current["fullscreen_chart"]
                  }

                  chartInstancesRef.current["fullscreen_chart"] =
                    new window.TradingView.widget({
                      symbol: config.symbol,
                      interval: chartSettings[newChartId].interval,
                      theme: chartSettings[newChartId].theme,
                      style: "1",
                      locale: "en",
                      container_id: "fullscreen_chart",
                      width:
                        typeof window !== "undefined"
                          ? window.innerWidth
                          : "100%",
                      height:
                        typeof window !== "undefined"
                          ? window.innerHeight - 64
                          : "460",
                      toolbar_bg: "#f1f3f6",
                      enable_publishing: false,
                      hide_top_toolbar: false,
                      save_image: true,
                      studies: chartSettings[newChartId].indicators,
                      drawings_access: {
                        type: "all",
                        tools: [{ name: "Regression Trend" }],
                      },
                    })
                }, 100)
              }}
              className="size-7 shrink-0 appearance-none rounded bg-black/40 text-transparent hover:bg-black/60"
            >
              {CHART_CONFIG.map(({ containerId, title }) => (
                <option
                  key={containerId}
                  value={containerId}
                  className="text-white"
                >
                  {title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>

          <Button
            onClick={onClose}
            size={"icon"}
            variant={"ghost"}
            className="h-6 w-6"
            aria-label="Exit fullscreen"
          >
            <ExitFullScreenIcon className="size-5" />
          </Button>
          <button
            onClick={() => {
              const currentSettings = chartSettings[fullscreenChart]
              setTimeout(
                () => reinitializeChart("fullscreen_chart", currentSettings),
                0
              )
            }}
            className="rounded bg-black/40 p-2 transition-colors hover:bg-black/60"
            aria-label="Refresh chart"
          >
            <ReloadIcon className="size-5" />
          </button>

          <select
            value={chartSettings[fullscreenChart].interval}
            onChange={(e) => {
              const updatedSettings = {
                ...chartSettings[fullscreenChart],
                interval: e.target.value,
              }
              updateChartSetting(fullscreenChart, updatedSettings)
              reinitializeChart("fullscreen_chart", updatedSettings)
            }}
            className="rounded bg-black/40 px-2 py-1 text-white"
          >
            {INTERVALS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              const indicator = e.target.value
              if (!indicator) return

              const updatedSettings = {
                ...chartSettings[fullscreenChart],
                indicators: [
                  ...new Set([
                    ...chartSettings[fullscreenChart].indicators,
                    indicator,
                  ]),
                ],
              }

              setChartSettings((prev) => ({
                ...prev,
                [fullscreenChart]: updatedSettings,
              }))

              reinitializeChart("fullscreen_chart", updatedSettings)
            }}
            className="rounded bg-black/40 px-2 py-1 text-white"
          >
            <option value="">+ Add Indicator</option>
            {INDICATORS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {chartSettings[fullscreenChart]?.indicators.map((indicator) => (
              <button
                key={indicator}
                onClick={() => {
                  const updatedSettings = {
                    ...chartSettings[fullscreenChart],
                    indicators: chartSettings[
                      fullscreenChart
                    ].indicators.filter((i) => i !== indicator),
                  }

                  setChartSettings((prev) => ({
                    ...prev,
                    [fullscreenChart]: updatedSettings,
                  }))

                  reinitializeChart("fullscreen_chart", updatedSettings)
                }}
                className="flex items-center gap-1 rounded bg-black/40 px-2 py-1 text-white hover:bg-black/60"
              >
                {INDICATORS.find((i) => i.value === indicator)?.label ||
                  indicator}
                <MinusIcon className="size-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Update openFullscreen function
  const openFullscreen = useCallback(
    (chartId) => {
      setFullscreenChart(chartId)
      // Reinitialize the chart in the fullscreen modal with all features
      setTimeout(() => {
        const config = CHART_CONFIG.find((c) => c.containerId === chartId)
        if (!config) return

        // Clean up existing fullscreen chart instance
        if (chartInstancesRef.current["fullscreen_chart"]) {
          try {
            chartInstancesRef.current["fullscreen_chart"].remove()
          } catch (error) {
            console.log("Chart cleanup failed:", error)
          }
          delete chartInstancesRef.current["fullscreen_chart"]
        }

        chartInstancesRef.current["fullscreen_chart"] =
          new window.TradingView.widget({
            symbol: config.symbol,
            interval: chartSettings[chartId].interval,
            theme: chartSettings[chartId].theme,
            style: "1",
            locale: "en",
            container_id: "fullscreen_chart",
            width: typeof window !== "undefined" ? window.innerWidth : "100%",
            height:
              typeof window !== "undefined" ? window.innerHeight - 64 : "460",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            hide_top_toolbar: false,
            save_image: true,
            studies: chartSettings[chartId].indicators,
            drawings_access: {
              type: "all",
              tools: [{ name: "Regression Trend" }],
            },
          })
      }, 100) // Increased delay
    },
    [chartSettings]
  )

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/crypto-prices")
        const { prices, adaBtcPriceData } = await response.json()
        setPrices(prices)
        setAdaBtcPriceData(adaBtcPriceData)
      } catch (error) {
        console.error("Error fetching prices:", error)
      } finally {
        setLoading(false)
      }
    }

    // Fetch prices immediately on mount
    fetchPrices()

    // Set interval to fetch prices every minute
    const interval = setInterval(fetchPrices, 60000) // 60000 ms = 1 minute

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const walletAddress = await getAddressFromHandle(handleName)

    // Check for rate limit error
    if (walletAddress?.error) {
      toast.error(walletAddress.error) // Show toast notification
      return
    }

    setWalletAddress(walletAddress)
  }

  // Update fullscreen modal in return statement
  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col gap-1">
        <h1 className="flex w-full justify-center font-bold">
          TradingView Charts
        </h1>
        {loading ? (
          <div className="flex flex-col gap-1">
            {CHART_CONFIG.map(({ containerId, title }) => (
              <Skeleton
                key={containerId}
                className="flex h-14 w-full cursor-pointer items-center gap-4 rounded border border-border p-4 text-center"
                aria-label={`Loading ${title} chart`}
              >
                <Skeleton className="h-5 w-[75px] bg-green/50 text-sm" />{" "}
                <Skeleton className="h-5 w-[100px] bg-green/50 text-sm" />{" "}
                <div className="flex w-full items-center justify-end gap-1">
                  <Skeleton className="h-5 w-[69px] bg-green/50 text-sm" />{" "}
                </div>
              </Skeleton>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {/* Left Column */}
            <div className="flex flex-col gap-1">
              {CHART_CONFIG.slice(0, 3).map(({ containerId, title }) => {
                const priceData = prices.find((p) => p.name === title)

                return (
                  <div
                    key={containerId}
                    onClick={() => openFullscreen(containerId)} // Open fullscreen on card click
                    className="flex h-14 w-full cursor-pointer items-center gap-4 rounded border border-border p-4 text-center"
                    aria-label={`Open ${title} chart`}
                  >
                    <div className="text-sm">
                      {title === "IAG/USDT"
                        ? title.replace("/USDT", "/USD")
                        : title}
                    </div>
                    <div className="text-sm">
                      {title === "ADA/BTC"
                        ? adaBtcPriceData.cardano.btc.toFixed(8)
                        : priceData?.price.toFixed(3) || ""}
                    </div>
                    <div className="flex w-full items-center justify-end gap-1">
                      <div
                        className={`text-[${
                          ((title === "ADA/BTC" &&
                            adaBtcPriceData.cardano.btc_24h_change.toFixed(
                              2
                            )) ||
                            priceData?.percentChange24h) > 0
                            ? "rgb(9,133,81)"
                            : "rgb(207,32,47)"
                        }]`}
                      >
                        {title === "ADA/BTC"
                          ? adaBtcPriceData.cardano.btc_24h_change.toFixed(2) +
                            "%"
                          : priceData?.percentChange24h.toFixed(2) || ""}
                        {priceData?.percentChange24h ? "%" : ""}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-1">
              {CHART_CONFIG.slice(3, 6).map(({ containerId, title }) => {
                const priceData = prices.find((p) => p.name === title)

                return (
                  <div
                    key={containerId}
                    onClick={() => openFullscreen(containerId)} // Open fullscreen on card click
                    className="flex h-14 w-full cursor-pointer items-center gap-4 rounded border border-border p-4 text-center"
                    aria-label={`Open ${title} chart`}
                  >
                    <div className="text-sm">
                      {title === "IAG/USDT"
                        ? title.replace("/USDT", "/USD")
                        : title}
                    </div>
                    <div className="text-sm">
                      {title === "ADA/BTC"
                        ? adaBtcPriceData.cardano.btc.toFixed(8)
                        : priceData?.price.toFixed(3) || ""}
                    </div>
                    <div className="flex w-full items-center justify-end">
                      <div
                        className={`text-[${
                          ((title === "ADA/BTC" &&
                            adaBtcPriceData.cardano.btc_24h_change.toFixed(
                              2
                            )) ||
                            priceData?.percentChange24h) > 0
                            ? "text-[rgb(9,133,81)]"
                            : "text-[rgb(207,32,47)]"
                        }]`}
                      >
                        {title === "ADA/BTC"
                          ? adaBtcPriceData.cardano.btc_24h_change.toFixed(2) +
                            "%"
                          : priceData?.percentChange24h.toFixed(2) || ""}
                        {priceData?.percentChange24h ? "%" : ""}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-2 rounded-md border border-border">
        <form
          className="col-span-1 flex w-full flex-col gap-2 p-5 sm:px-20"
          onSubmit={handleSubmit}
        >
          <h1 className="flex w-full items-center justify-center gap-2 text-center text-2xl font-bold">
            <TooltipProvider>
              <div className="flex w-full items-center justify-center gap-2 text-center text-2xl font-bold">
                <Tooltip>
                  <TooltipTrigger asChild className="hover:cursor-pointer">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <InfoIcon className="size-4" />
                      Find Wallet Address
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>only resolves old cip handles for now</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </h1>
          <Input
            type="text"
            placeholder="Enter $adahandle"
            value={handleName}
            className="w-full"
            onChange={(e) => setHandleName(e.target.value)}
            autoComplete="on"
          />
          <Button type="submit" className="w-1/2">
            Fetch Wallet Address
          </Button>
        </form>
        {walletAddress && (
          <div className="col-span-1 overflow-hidden break-all border-t border-border bg-secondary/50 p-5 text-center">
            <div className="relative flex flex-row items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground sm:text-lg">
                {walletAddress.length === 0
                  ? "No wallet address found"
                  : walletAddress}
              </span>
              {walletAddress.length > 0 && (
                <Button
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress)
                    toast.success("Copied to clipboard")
                  }}
                >
                  <CopyIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {fullscreenChart && ( // Only render the fullscreen chart when a card is clicked
        <div className="fixed inset-0 z-50 bg-black/90">
          <FullscreenChartControls onClose={() => setFullscreenChart(null)} />
          <div className="absolute inset-x-0 bottom-0 top-[64px] w-full">
            <div id="fullscreen_chart" className="size-full" />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-1">
        {prices[0] && !loading ? (
          <ConvertAda adaPrice={prices[0].price} btcPrice={prices[2].price} />
        ) : (
          <Loader2 className="mt-20 size-10 animate-spin" />
        )}
      </div>
    </div>
  )
}

export default TradingViewChart
