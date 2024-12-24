/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import {
  ExitFullScreenIcon,
  ReloadIcon,
  MinusIcon,
} from "@radix-ui/react-icons"
import { Button } from "./ui/button"
import { ChevronDown, CopyIcon, InfoIcon, Loader2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import ConvertAda from "./ConvertAda"
import { getAddressFromHandle } from "@/app/actions"
import { Input } from "./ui/input"
import { toast } from "sonner"
import Image from "next/image"

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
  const [loadingAdahandle, setLoadingAdahandle] = useState(false)
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
  const [prices, setPrices] = useState([])
  const [adaBtcPriceData, setAdaBtcPriceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [headerLoading, setHeaderLoading] = useState(false)
  const [handleName, setHandleName] = useState("")
  const [walletAddress, setWalletAddress] = useState({})
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const RATE_LIMIT = 15000 // 15 seconds

  // Add a ref to track mounted charts
  const chartInstancesRef = useRef({})

  // Add a ref to track the last updated chart
  const lastUpdatedChartRef = useRef(null)

  // Add a ref to store widget reference
  const widgetRef = useRef(null)

  // Add chart controls component

  // Add this helper function near the top of the component
  const cleanupChart = (chartId) => {
    if (chartInstancesRef.current[chartId]) {
      try {
        chartInstancesRef.current[chartId].remove()
      } catch (error) {
        console.log(`Chart cleanup failed for ${chartId}:`, error)
      }
      delete chartInstancesRef.current[chartId]
    }
  }

  // Update initializeChart to only depend on the specific chart's settings
  const initializeChart = useCallback(
    (containerId) => {
      if (typeof window === "undefined") return // Check if running in the browser

      const config = CHART_CONFIG.find((c) => c.containerId === containerId)
      if (!config || !document.getElementById(containerId)) return

      const settings = chartSettings[containerId]

      // Clean up existing chart instance if it exists
      cleanupChart(containerId)

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
      initializeChart(CHART_CONFIG[0].containerId)
    }

    return () => {
      // Cleanup chart instances
      cleanupChart(CHART_CONFIG[0].containerId)

      // Cleanup script element
      const scriptElement = document.querySelector(
        'script[src="https://s3.tradingview.com/tv.js"]'
      )
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [initializeChart])

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
                const config = CHART_CONFIG.find(
                  (c) => c.containerId === newChartId
                )
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
            className="size-6"
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

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
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
      })
    },
    [chartSettings]
  )

  const fetchPrices = async (initialLoad = false, fromInterval = false) => {
    if (initialLoad) {
      setLoading(true)
    }
    if (fromInterval) {
      setHeaderLoading(true)
    }
    try {
      const response = await fetch("/api/crypto-prices")
      const { prices, adaBtcPriceData } = await response.json()

      setPrices(prices)
      setAdaBtcPriceData(adaBtcPriceData)
    } catch (error) {
      console.error("Error fetching prices:", error)
    } finally {
      if (initialLoad) {
        setLoading(false)
      }
      if (fromInterval) {
        setHeaderLoading(false)
      }
    }
  }

  useEffect(() => {
    // Fetch prices immediately on mount
    fetchPrices(true)
    // Update interval to 15 seconds instead of 60 seconds
    const interval = setInterval(() => fetchPrices(false, true), 15000) // Pass true for fromInterval

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    try {
      const { stakeAddress, image, address, error } =
        await getAddressFromHandle(handleName)
      // Check for rate limit error
      if (error || !stakeAddress) {
        toast.error(error || "No wallet address found") // Show toast notification
        return
      }

      setWalletAddress({ stakeAddress, image, address })
      const newHandleName = handleName.toLowerCase()
      setHandleName(newHandleName)
    } catch (error) {
      console.error("Error fetching wallet address:", error)
    } finally {
      setLoadingAdahandle(false)
    }
  }

  useEffect(() => {
    let timer
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer) // Cleanup on unmount
  }, [remainingTime])

  // Update fullscreen modal in return statement
  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-center gap-1">
          <h1 className="font-bold">TradingView Charts</h1>
          <div className="flex size-6 items-center justify-center">
            {headerLoading && <Loader2 className="size-5 animate-spin" />}
          </div>
        </div>
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
            {[0, 1].map((columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-1">
                {loading || prices.length === 0 ? (
                  <div className="flex h-14 w-full items-center justify-center">
                    <Skeleton className="h-5 w-[100px] text-sm" />
                  </div>
                ) : (
                  CHART_CONFIG.slice(
                    columnIndex * 3,
                    (columnIndex + 1) * 3
                  ).map(({ containerId, title }) => {
                    const priceData = prices.find((p) => p.name === title)
                    const isAdaBtc = title === "ADA/BTC"
                    const price = isAdaBtc
                      ? adaBtcPriceData.cardano?.btc.toFixed(8)
                      : priceData?.price?.toFixed(3)
                    const percentChange = isAdaBtc
                      ? adaBtcPriceData.cardano?.btc_24h_change?.toFixed(2)
                      : priceData?.percentChange24h?.toFixed(2)
                    const isPositiveChange = isAdaBtc
                      ? adaBtcPriceData.cardano?.btc_24h_change > 0
                      : priceData?.percentChange24h > 0

                    return (
                      <div
                        key={containerId}
                        onClick={() => openFullscreen(containerId)}
                        className="flex h-14 w-full cursor-pointer items-center gap-4 rounded border border-border p-4 text-center"
                        aria-label={`Open ${title} chart`}
                      >
                        <div className="font-sans text-[#333] dark:text-[#c2c2c2]">
                          {title === "IAG/USDT"
                            ? title.replace("/USDT", "/USD")
                            : title}
                        </div>
                        <div
                          className={`font-sans ${columnIndex === 0 ? "text-blue dark:text-sky-500/85" : "text-red-500"}`}
                        >
                          {price || ""}
                        </div>
                        <div className="flex w-full items-center justify-end gap-1">
                          <div
                            className={`text-[${isPositiveChange ? "rgb(9,133,81)" : "rgb(207,32,47)"}]`}
                          >
                            {percentChange || ""}
                            {percentChange ? "%" : ""}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-2 rounded-md border border-border">
        <form
          className="col-span-1 flex w-full flex-col items-center justify-center gap-2 p-5 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault() // Prevent default form submission
            setLoadingAdahandle(true) // Set loading state to true
            handleSubmit() // Call the handleSubmit function
          }}
        >
          <h1 className="flex items-center gap-2 text-center text-2xl font-bold">
            <div className="flex flex-col gap-2">Resolve Adahandle</div>
          </h1>
          <Input
            type="text"
            placeholder="$adahandle"
            value={handleName}
            className="w-[44.44%]"
            onChange={(e) => setHandleName(e.target.value)}
            autoComplete="on"
          />
          <Button type="submit" className="w-[25%]" disabled={loadingAdahandle}>
            <span className="relative flex flex-row items-center gap-2">
              <span className="whitespace-nowrap">Search</span>
              <span className="flex items-center">
                {loadingAdahandle && (
                  <Loader2 className="absolute -right-3.5 size-5 animate-spin text-white" />
                )}
              </span>
            </span>
          </Button>
        </form>
        {walletAddress.stakeAddress && (
          <div className="col-span-1 overflow-hidden break-all border-t border-border bg-secondary/40 p-6 text-center shadow-md">
            <div className="relative grid w-full grid-cols-1 items-center gap-2 sm:grid-cols-3">
              <Image
                src={
                  walletAddress.image &&
                  walletAddress.image.startsWith("ipfs://")
                    ? `https://ipfs.io/ipfs/${walletAddress.image.replace("ipfs://", "")}`
                    : walletAddress.image
                }
                width={800}
                height={800}
                alt="wallet image"
                className="col-span-1 mx-auto mb-1 size-36 object-cover sm:mb-0"
              />
              <div className="col-span-1 flex flex-col sm:p-2">
                <span className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="text-base sm:text-lg">Stake Address</span>{" "}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-5 sm:h-[1.6rem] sm:w-[1.55rem]"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress.stakeAddress)
                      toast.success("Copied stake address")
                    }}
                  >
                    <CopyIcon className="size-3 sm:size-3.5" />
                  </Button>
                </span>
                <span className="line-clamp-1 text-center sm:line-clamp-3">
                  {walletAddress.length === 0
                    ? "No wallet address found"
                    : walletAddress.stakeAddress}
                </span>
              </div>
              <div className="col-span-1 flex flex-col sm:p-2">
                <span className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="text-base sm:text-lg">Address</span>{" "}
                  <Button
                    size="icon"
                    className="size-5 sm:size-[1.55rem]"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress.address)
                      toast.success("Copied address")
                    }}
                  >
                    <CopyIcon className="size-3 sm:size-3.5" />
                  </Button>
                </span>
                <span className="line-clamp-1 text-center sm:line-clamp-3">
                  {walletAddress.length === 0
                    ? "No wallet address found"
                    : walletAddress.address}
                </span>
              </div>
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
