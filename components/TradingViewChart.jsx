/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { ReloadIcon, MinusIcon, EnterFullScreenIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import ConvertAda from './ConvertAda'
import { Badge } from './ui/badge'
import { Loader2 } from 'lucide-react'

const CHART_CONFIG = [
  {
    symbol: 'BINANCE:ADAUSD',
    containerId: 'tradingview_ada_usd',
    title: 'ADA/USD',
  },
  {
    symbol: 'GATEIO:IAGUSDT',
    containerId: 'tradingview_iag_usdt',
    title: 'IAG/USDT',
  },
  {
    symbol: 'BINANCE:ADABTC',
    containerId: 'tradingview_ada_btc',
    title: 'ADA/BTC',
  },
  {
    symbol: 'CRYPTOCAP:ADA.D',
    containerId: 'tradingview_ada_dominance',
    title: 'ADA.D',
  },
  {
    symbol: 'CRYPTOCAP:BTC.D',
    containerId: 'tradingview_btc_dominance',
    title: 'BTC.D',
  },
  {
    symbol: 'BINANCE:ADAETH',
    containerId: 'tradingview_ada_eth',
    title: 'ADA/ETH',
  },
]

// Add chart intervals and themes configuration
const INTERVALS = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
]

// Update the INDICATORS constant
const INDICATORS = [
  { label: 'MACD', value: 'MACD@tv-basicstudies' },
  { label: 'RSI', value: 'RSI@tv-basicstudies' },
  { label: 'Volume', value: 'Volume@tv-basicstudies' },
  { label: 'MA 20', value: 'MA@tv-basicstudies,20' },
]

function TradingViewChart() {
  const [fullscreenChart, setFullscreenChart] = useState(null)
  const [loadingAdahandle, setLoadingAdahandle] = useState(false)
  const [chartSettings, setChartSettings] = useState(
    CHART_CONFIG.reduce(
      (acc, { containerId }) => ({
        ...acc,
        [containerId]: {
          interval: 'D',
          theme: 'dark',
          indicators: [],
        },
      }),
      {},
    ),
  )
  const [prices, setPrices] = useState([])
  const [adaBtcPriceData, setAdaBtcPriceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [headerLoading, setHeaderLoading] = useState(false)
  const [error, setError] = useState(null)

  // Add a ref to track mounted charts
  const chartInstancesRef = useRef({})

  // Add a ref to track the last updated chart
  const lastUpdatedChartRef = useRef(null)

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
      if (typeof window === 'undefined') return // Check if running in the browser

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
        style: '1',
        locale: 'en',
        container_id: containerId,
        width: '100%',
        height: '460',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: settings.indicators,
        drawings_access: { type: 'all', tools: [{ name: 'Regression Trend' }] },
      })
    },
    [chartSettings],
  )

  // Update useEffect to initialize charts
  useEffect(() => {
    if (typeof window === 'undefined') return // Check if running in the browser

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      initializeChart(CHART_CONFIG[0].containerId)
    }

    return () => {
      // Cleanup chart instances
      cleanupChart(CHART_CONFIG[0].containerId)

      // Cleanup script element
      const scriptElement = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')
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
    [initializeChart],
  )

  // Update the reinitializeChart function to ensure proper cleanup and initialization
  const reinitializeChart = (containerId, settings) => {
    if (!document.getElementById(containerId)) return

    const config = CHART_CONFIG.find(
      (c) => c.containerId === (containerId === 'fullscreen_chart' ? fullscreenChart : containerId),
    )
    if (!config) return

    // Clean up existing chart instance
    if (chartInstancesRef.current[containerId]) {
      try {
        chartInstancesRef.current[containerId].remove()
      } catch (error) {
        console.log('Chart cleanup failed:', error)
        setError(error.message)
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
        style: '1',
        locale: 'en',
        container_id: containerId,
        width: '100%',
        height: containerId === 'fullscreen_chart' && typeof window !== 'undefined' ? window.innerHeight - 64 : '460',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: settings.indicators,
        drawings_access: { type: 'all', tools: [{ name: 'Regression Trend' }] },
        autosize: true,
      })
    }, 50)

    updateChartSetting(containerId, settings)
  }

  // Update FullscreenChartControls component
  const FullscreenChartControls = ({ onClose }) => (
    <div className="absolute inset-x-0 -top-1 z-10">
      <div className="flex items-center justify-between overflow-x-auto p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Add chart selector dropdown */}
          <div className="relative">
            <select
              value={fullscreenChart}
              onChange={(e) => {
                const newChartId = e.target.value
                setFullscreenChart(newChartId)
                // Reinitialize with the new chart
                const config = CHART_CONFIG.find((c) => c.containerId === newChartId)
                if (!config) return

                // Clean up existing fullscreen chart instance
                if (chartInstancesRef.current['fullscreen_chart']) {
                  try {
                    chartInstancesRef.current['fullscreen_chart'].remove()
                  } catch (error) {
                    console.log('Chart cleanup failed:', error)
                  }
                  delete chartInstancesRef.current['fullscreen_chart']
                }

                chartInstancesRef.current['fullscreen_chart'] = new window.TradingView.widget({
                  symbol: config.symbol,
                  interval: chartSettings[newChartId].interval,
                  theme: chartSettings[newChartId].theme,
                  style: '1',
                  locale: 'en',
                  container_id: 'fullscreen_chart',
                  width: typeof window !== 'undefined' ? window.innerWidth : '100%',
                  height: typeof window !== 'undefined' ? window.innerHeight - 64 : '460',
                  toolbar_bg: '#f1f3f6',
                  enable_publishing: false,
                  hide_top_toolbar: false,
                  save_image: true,
                  studies: chartSettings[newChartId].indicators,
                  drawings_access: {
                    type: 'all',
                    tools: [{ name: 'Regression Trend' }],
                  },
                })
              }}
              className="rounded border border-border p-2"
            >
              {CHART_CONFIG.map(({ containerId, title }) => (
                <option key={containerId} value={containerId}>
                  {title}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={onClose}
            size={'icon'}
            variant={'outline'}
            className="size-9 rounded bg-white p-2 transition-colors dark:bg-[#141414]/90"
            aria-label="Exit fullscreen"
          >
            <EnterFullScreenIcon className="size-5" />
          </Button>
          <Button
            onClick={() => {
              const currentSettings = chartSettings[fullscreenChart]
              setTimeout(() => reinitializeChart('fullscreen_chart', currentSettings), 0)
            }}
            variant={'outline'}
            size={'icon'}
            className="size-9 rounded bg-white p-2 transition-colors dark:bg-[#141414]/90"
            aria-label="Refresh chart"
          >
            <ReloadIcon className="size-5" />
          </Button>

          <select
            value={chartSettings[fullscreenChart].interval}
            onChange={(e) => {
              const updatedSettings = {
                ...chartSettings[fullscreenChart],
                interval: e.target.value,
              }
              updateChartSetting(fullscreenChart, updatedSettings)
              reinitializeChart('fullscreen_chart', updatedSettings)
            }}
            className="rounded border border-border p-1.5"
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
                indicators: [...new Set([...chartSettings[fullscreenChart].indicators, indicator])],
              }

              setChartSettings((prev) => ({
                ...prev,
                [fullscreenChart]: updatedSettings,
              }))

              reinitializeChart('fullscreen_chart', updatedSettings)
            }}
            className="rounded border border-border p-1.5"
          >
            <option value="">Add Indicator</option>
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
                    indicators: chartSettings[fullscreenChart].indicators.filter((i) => i !== indicator),
                  }

                  setChartSettings((prev) => ({
                    ...prev,
                    [fullscreenChart]: updatedSettings,
                  }))

                  reinitializeChart('fullscreen_chart', updatedSettings)
                }}
                className="flex items-center gap-1 rounded px-2 py-1"
              >
                {INDICATORS.find((i) => i.value === indicator)?.label || indicator}
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
      if (chartInstancesRef.current['fullscreen_chart']) {
        try {
          chartInstancesRef.current['fullscreen_chart'].remove()
        } catch (error) {
          console.log('Chart cleanup failed:', error)
        }
        delete chartInstancesRef.current['fullscreen_chart']
      }

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        chartInstancesRef.current['fullscreen_chart'] = new window.TradingView.widget({
          symbol: config.symbol,
          interval: chartSettings[chartId].interval,
          theme: chartSettings[chartId].theme,
          style: '1',
          locale: 'en',
          container_id: 'fullscreen_chart',
          width: typeof window !== 'undefined' ? window.innerWidth : '100%',
          height: typeof window !== 'undefined' ? window.innerHeight - 64 : '460',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          save_image: true,
          studies: chartSettings[chartId].indicators,
          drawings_access: {
            type: 'all',
            tools: [{ name: 'Regression Trend' }],
          },
        })
      })
    },
    [chartSettings],
  )

  const fetchPrices = async (initialLoad = false, fromInterval = false) => {
    if (initialLoad) {
      setLoading(true)
    }
    if (fromInterval) {
      setHeaderLoading(true)
    }

    const maxRetries = 5 // Maximum number of retries
    let attempt = 0 // Current attempt number

    while (attempt < maxRetries) {
      try {
        const response = await fetch('/api/crypto-prices')
        const { prices, adaBtcPriceData } = await response.json()

        if (response.status === 429) {
          throw new Error('Too many requests')
        }

        setPrices(prices)
        setAdaBtcPriceData(adaBtcPriceData)
        break // Exit the loop if successful
      } catch (error) {
        if (error.message === 'Too many requests') {
          attempt++
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`Attempt ${attempt}: ${error.message}. Retrying in ${waitTime / 1000} seconds...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime)) // Wait before retrying
        } else {
          setError(error.message)
          break // Exit the loop on other errors
        }
      } finally {
        if (initialLoad) {
          setLoading(false)
        }
        if (fromInterval) {
          setHeaderLoading(false)
        }
      }
    }
  }

  useEffect(() => {
    // Fetch prices immediately on mount
    fetchPrices(true)
    // Update interval to 15 seconds instead of 60 seconds
    const interval = setInterval(() => fetchPrices(false, true), 20000) // Pass true for fromInterval

    return () => clearInterval(interval)
  }, [])

  // Update fullscreen modal in return statement
  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-center gap-1">
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
                <Skeleton className="h-5 w-[75px] bg-green/50 text-sm" />{' '}
                <Skeleton className="h-5 w-[100px] bg-green/50 text-sm" />{' '}
                <div className="flex w-full items-center justify-end gap-1">
                  <Skeleton className="h-5 w-[69px] bg-green/50 text-sm" />{' '}
                </div>
              </Skeleton>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-5">
            {[0, 1].map((columnIndex) => (
              <div
                key={columnIndex}
                className={`flex flex-col gap-1 ${columnIndex === 0 ? 'sm:col-span-3' : 'sm:col-span-2'}`}
              >
                {loading || !prices ? (
                  <div className="flex h-14 w-full items-center justify-center">
                    <Skeleton className="h-5 w-[100px] text-sm" />
                  </div>
                ) : (
                  CHART_CONFIG.slice(columnIndex * 3, (columnIndex + 1) * 3).map(({ containerId, title }) => {
                    try {
                      const priceData = prices.find((p) => p.name === title)
                      const isAdaBtc = title === 'ADA/BTC'
                      const price = isAdaBtc
                        ? adaBtcPriceData.cardano?.btc.toFixed(8)
                        : priceData?.price
                          ? priceData?.price?.toFixed(3)
                          : null
                      const percentChange = isAdaBtc
                        ? adaBtcPriceData.cardano?.btc_24h_change?.toFixed(2)
                        : priceData?.percentChange24h
                          ? priceData?.percentChange24h?.toFixed(2)
                          : null
                      const isPositiveChange = isAdaBtc
                        ? adaBtcPriceData.cardano?.btc_24h_change > 0
                        : priceData?.percentChange24h
                          ? priceData?.percentChange24h > 0
                          : false
                      return (
                        <div
                          key={containerId}
                          onClick={() => openFullscreen(containerId)}
                          className="flex h-14 w-full cursor-pointer gap-4 rounded border border-border p-4 text-center font-sans transition-colors duration-75 hover:bg-secondary/20"
                          aria-label={`Open ${title} chart`}
                        >
                          <div
                            className={`${
                              columnIndex === 0
                                ? ''
                                : 'sm:flex sm:w-full sm:items-center sm:justify-center sm:text-center'
                            } `}
                          >
                            <Badge
                              size={'sm'}
                              variant={'outline'}
                              className="font-sans text-sm text-muted-foreground md:text-base"
                            >
                              {title === 'IAG/USDT' ? title.replace('/USDT', '/USD') : title}
                            </Badge>
                          </div>
                          {percentChange && (
                            <Badge
                              className="border-none font-sans text-sm text-muted-foreground md:text-base"
                              variant={'link'}
                            >
                              {price || ''}
                            </Badge>
                          )}
                          {percentChange && (
                            <div className="flex w-full items-center justify-end gap-1">
                              <Badge
                                variant={'outline'}
                                size={'sm'}
                                className="font-sans text-sm text-muted-foreground md:text-base"
                                style={{
                                  color: isPositiveChange ? 'rgb(9, 133, 81)' : 'rgb(207, 32, 47)',
                                }}
                              >
                                <span>
                                  {percentChange || ''}
                                  {percentChange ? '%' : ''}
                                </span>
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    } catch (error) {
                      console.error('Error fetching prices:', error)
                    }
                  })
                )}
              </div>
            ))}
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

      {/* <div className="flex flex-col items-center justify-center gap-1">
        {error ? (
          <p>Error fetching prices. Please try again later.</p>
        ) : (
          <ConvertAda
            adaPrice={prices.length > 0 ? prices[0].price : null}
            btcPrice={prices.length > 2 ? prices[2].price : null}
          />
        )}
      </div> */}
    </div>
  )
}

export default TradingViewChart
