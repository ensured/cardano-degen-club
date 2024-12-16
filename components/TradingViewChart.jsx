/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useState, useCallback, useRef, act } from "react"
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  ReloadIcon,
  MinusIcon,
} from "@radix-ui/react-icons"
import { Button } from "./ui/button"
import { ChevronDown } from "lucide-react"

// Move chart configuration outside component to prevent recreating on each render
const CHART_CONFIG = [
  { symbol: "BINANCE:ADAUSD", containerId: "tradingview_ada_usd", title: "ADA/USD" },
  { symbol: "GATEIO:IAGUSDT", containerId: "tradingview_iag_usdt", title: "IAG/USDT" },
  { symbol: "BINANCE:ADABTC", containerId: "tradingview_ada_btc", title: "ADA/BTC" },
  { symbol: "CRYPTOCAP:ADA.D", containerId: "tradingview_ada_dominance", title: "ADA Dominance" },
  { symbol: "CRYPTOCAP:BTC.D", containerId: "tradingview_btc_dominance", title: "BTC Dominance" },
  { symbol: "BINANCE:ADAETH", containerId: "tradingview_ada_eth", title: "ADA/ETH" },
 
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

const THEMES = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
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
    CHART_CONFIG.reduce((acc, { containerId }) => ({
      ...acc,
      [containerId]: { 
        interval: "D", 
        theme: "dark",
        indicators: [] 
      }
    }), {})
  )
  const [activeChart, setActiveChart] = useState(CHART_CONFIG[0].containerId)

  // Add a ref to track mounted charts
  const chartInstancesRef = useRef({})

  // Add a ref to track the last updated chart
  const lastUpdatedChartRef = useRef(null)

  // Add chart controls component
  const ChartControls = ({ containerId }) => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isScrollable, setIsScrollable] = useState(false);

    // Check if content is scrollable
    const checkScrollable = useCallback(() => {
      if (containerRef.current) {
        const isContentScrollable = containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsScrollable(isContentScrollable);
      }
    }, []);

    // Check on mount and window resize
    useEffect(() => {
      checkScrollable();
      window.addEventListener('resize', checkScrollable);
      return () => window.removeEventListener('resize', checkScrollable);
    }, [checkScrollable]);

    const handleMouseDown = (e) => {
      if (!isScrollable) return;
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    };
  
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);
  
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Add chart change handler
    const handleChartChange = (newChartId) => {
      // Clean up current chart
      if (chartInstancesRef.current[activeChart]) {
        try {
          chartInstancesRef.current[activeChart].remove()
        } catch (error) {
          console.log('Chart cleanup failed:', error)
        }
        delete chartInstancesRef.current[activeChart]
      }
      
      setActiveChart(newChartId)
      // Chart will be initialized by the useEffect
    }

    return (
      <div className="flex bg-secondary p-2 dark:bg-black/40">
        <div
          ref={containerRef}
          className={`scrollable-container custom-scrollbar flex w-full items-center gap-2 overflow-x-auto ${
            isScrollable ? 'is-scrollable' : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <select
                value={activeChart}
                onChange={(e) => handleChartChange(e.target.value)}
                className="appearance-none h-7 w-7 shrink-0 rounded bg-black/40 text-transparent hover:bg-black/60"
              >
                {CHART_CONFIG.map(({ containerId, title }) => (
                  <option key={containerId} value={containerId} className="text-white">
                    {title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 text-white" />
            </div>
            <select
              value={chartSettings[containerId].interval}
              onChange={(e) => {
                updateChartSetting(containerId, { interval: e.target.value })
              }}
              className="shrink-0 rounded bg-black/40 px-1 py-0.5 text-xs text-white"
            >
              {INTERVALS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => initializeChart(containerId)}
              className="shrink-0 rounded bg-black/40 p-1 transition-colors hover:bg-black/60"
              aria-label="Refresh chart"f
            >
              <ReloadIcon className="size-4" />
            </button>
            <select
              value=""
              onChange={(e) => {
                const indicator = e.target.value
                if (!indicator) return
                
                const updatedSettings = {
                  ...chartSettings[containerId],
                  indicators: [...new Set([...chartSettings[containerId].indicators, indicator])]
                }
                
                setChartSettings(prev => ({
                  ...prev,
                  [containerId]: updatedSettings
                }))
                
                reinitializeChart(containerId, updatedSettings)
              }}
              className="shrink-0 rounded bg-black/40 px-1 py-0.5 text-xs text-white"
            >
              <option value="">+ Add Indicator</option>
              {INDICATORS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              value={chartSettings[containerId].theme}
              onChange={(e) => {
                updateChartSetting(containerId, { theme: e.target.value })
                setTimeout(() => initializeChart(containerId), 0);
              }}
              className="shrink-0 rounded bg-black/40 px-1 py-0.5 text-xs text-white"
            >
              {THEMES.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <Button
              onClick={() => openFullscreen(containerId)}
              size={"icon"}
              variant={"ghost"}
              className="h-6 w-6"
              aria-label="Enter fullscreen"
            >
              <EnterFullScreenIcon className="size-5" />
            </Button>
            <div className="flex shrink-0 flex-nowrap gap-1">
              {chartSettings[containerId].indicators.map((indicator) => (
                <button
                  key={indicator}
                  onClick={() => {
                    const updatedSettings = {
                      ...chartSettings[containerId],
                      indicators: chartSettings[containerId].indicators.filter(i => i !== indicator)
                    }
                    
                    setChartSettings(prev => ({
                      ...prev,
                      [containerId]: updatedSettings
                    }))
                    
                    reinitializeChart(containerId, updatedSettings)
                  }}
                  className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-xs text-white hover:bg-black/60"
                >
                  {INDICATORS.find(i => i.value === indicator)?.label || indicator}
                  <MinusIcon className="size-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update initializeChart to only depend on the specific chart's settings
  const initializeChart = useCallback((containerId) => {
    const config = CHART_CONFIG.find(c => c.containerId === containerId)
    if (!config || !document.getElementById(containerId)) return

    const settings = chartSettings[containerId]
    
    // Clean up existing chart instance if it exists
    if (chartInstancesRef.current[containerId]) {
      try {
        chartInstancesRef.current[containerId].remove()
      } catch (error) {
        console.log('Chart cleanup failed:', error)
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
      drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
    })
  }, [chartSettings])

  // Update useEffect to initialize charts
  useEffect(() => {
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
          console.log('Chart cleanup failed:', error)
        }
        delete chartInstancesRef.current[activeChart]
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [activeChart, initializeChart])

  // Update the chart settings handler
  const updateChartSetting = useCallback((containerId, updates) => {
    lastUpdatedChartRef.current = containerId
    setChartSettings(prev => ({
      ...prev,
      [containerId]: {
        ...prev[containerId],
        ...updates
      }
    }))
    // Initialize only the specific chart after a short delay
    setTimeout(() => initializeChart(containerId), 0)
  }, [initializeChart])

  // Update the reinitializeChart function to ensure proper cleanup and initialization
  const reinitializeChart = (containerId, settings) => {
    if (!document.getElementById(containerId)) return
    
    const config = CHART_CONFIG.find(c => c.containerId === (containerId === "fullscreen_chart" ? fullscreenChart : containerId))
    if (!config) return

    // Clean up existing chart instance
    if (chartInstancesRef.current[containerId]) {
      try {
        chartInstancesRef.current[containerId].remove()
      } catch (error) {
        console.log('Chart cleanup failed:', error)
      }
      delete chartInstancesRef.current[containerId]
    }

    // Wait for DOM to be ready
    setTimeout(() => {
      if (!document.getElementById(containerId)) return;
      
      // Create new chart instance
      chartInstancesRef.current[containerId] = new window.TradingView.widget({
        symbol: config.symbol,
        interval: settings.interval,
        theme: settings.theme,
        style: "1",
        locale: "en",
        container_id: containerId,
        width: "100%",
        height: containerId === "fullscreen_chart" ? window.innerHeight - 64 : "460",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: settings.indicators,
        drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
        autosize: true,
      })
    }, 50)
  }

  // Update FullscreenChartControls component
  const FullscreenChartControls = ({ onClose }) => (
    <div className="absolute inset-x-0 -top-2 z-10">
      <div className="flex items-center justify-between bg-black/30 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Add chart selector dropdown */}
          <div className="relative">
            <select
              value={fullscreenChart}
              onChange={(e) => {
                const newChartId = e.target.value;
                setFullscreenChart(newChartId);
                // Reinitialize with the new chart
                setTimeout(() => {
                  const config = CHART_CONFIG.find(c => c.containerId === newChartId);
                  if (!config) return;

                  if (chartInstancesRef.current["fullscreen_chart"]) {
                    try {
                      chartInstancesRef.current["fullscreen_chart"].remove();
                    } catch (error) {
                      console.log('Chart cleanup failed:', error);
                    }
                    delete chartInstancesRef.current["fullscreen_chart"];
                  }

                  chartInstancesRef.current["fullscreen_chart"] = new window.TradingView.widget({
                    symbol: config.symbol,
                    interval: chartSettings[newChartId].interval,
                    theme: chartSettings[newChartId].theme,
                    style: "1",
                    locale: "en",
                    container_id: "fullscreen_chart",
                    width: window.innerWidth,
                    height: window.innerHeight - 64,
                    toolbar_bg: "#f1f3f6",
                    enable_publishing: false,
                    hide_top_toolbar: false,
                    save_image: true,
                    studies: chartSettings[newChartId].indicators,
                    drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
                  });
                }, 100);
              }}
              className="appearance-none h-7 w-7 shrink-0 rounded bg-black/40 text-transparent hover:bg-black/60"
            >
              {CHART_CONFIG.map(({ containerId, title }) => (
                <option key={containerId} value={containerId} className="text-white">
                  {title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 text-white" />
          </div>

          <select
            value={chartSettings[fullscreenChart].interval}
            onChange={(e) => {
              const updatedSettings = {
                ...chartSettings[fullscreenChart],
                interval: e.target.value
              }
              setChartSettings(prev => ({
                ...prev,
                [fullscreenChart]: updatedSettings
              }))
              setTimeout(() => reinitializeChart("fullscreen_chart", updatedSettings), 0)
            }}
            className="rounded bg-black/40 px-2 py-1 text-white"
          >
            {INTERVALS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const currentSettings = chartSettings[fullscreenChart]
              setTimeout(() => reinitializeChart("fullscreen_chart", currentSettings), 0)
            }}
            className="rounded bg-black/40 p-2 transition-colors hover:bg-black/60"
            aria-label="Refresh chart"
          >
            <ReloadIcon className="size-5" />
          </button>
          <select
            value=""
            onChange={(e) => {
              const indicator = e.target.value
              if (!indicator) return
              
              const updatedSettings = {
                ...chartSettings[fullscreenChart],
                indicators: [...new Set([...chartSettings[fullscreenChart].indicators, indicator])]
              }
              
              setChartSettings(prev => ({
                ...prev,
                [fullscreenChart]: updatedSettings
              }))
              
              reinitializeChart("fullscreen_chart", updatedSettings)
            }}
            className="rounded bg-black/40 px-2 py-1 text-white"
          >
            <option value="">+ Add Indicator</option>
            {INDICATORS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {chartSettings[fullscreenChart]?.indicators.map((indicator) => (
              <button
                key={indicator}
                onClick={() => {
                  const updatedSettings = {
                    ...chartSettings[fullscreenChart],
                    indicators: chartSettings[fullscreenChart].indicators.filter(i => i !== indicator)
                  }
                  
                  setChartSettings(prev => ({
                    ...prev,
                    [fullscreenChart]: updatedSettings
                  }))
                  
                  reinitializeChart("fullscreen_chart", updatedSettings)
                }}
                className="flex items-center gap-1 rounded bg-black/40 px-2 py-1 text-white hover:bg-black/60"
              >
                {INDICATORS.find(i => i.value === indicator)?.label || indicator}
                <MinusIcon className="size-3" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={chartSettings[fullscreenChart].theme}
            onChange={(e) => {
              updateChartSetting(fullscreenChart, { theme: e.target.value })
              // Reinitialize fullscreen chart
              setTimeout(() => {
                const config = CHART_CONFIG.find(c => c.containerId === fullscreenChart)
                if (!config) return

                if (chartInstancesRef.current["fullscreen_chart"]) {
                  try {
                    chartInstancesRef.current["fullscreen_chart"].remove()
                  } catch (error) {
                    console.log('Chart cleanup failed:', error)
                  }
                  delete chartInstancesRef.current["fullscreen_chart"]
                }

                chartInstancesRef.current["fullscreen_chart"] = new window.TradingView.widget({
                  symbol: config.symbol,
                  interval: chartSettings[fullscreenChart].interval,
                  theme: e.target.value,
                  style: "1",
                  locale: "en",
                  container_id: "fullscreen_chart",
                  width: window.innerWidth,
                  height: window.innerHeight - 64,
                  toolbar_bg: "#f1f3f6",
                  enable_publishing: false,
                  hide_top_toolbar: false,
                  save_image: true,
                  studies: chartSettings[fullscreenChart].indicators,
                  drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
                })
              }, 100)
            }}
            className="rounded bg-black/40 px-2 py-1 text-white"
          >
            {THEMES.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button
            onClick={onClose}
            size={"icon"}
            variant={"ghost"}
            className="h-6 w-6"
            aria-label="Exit fullscreen"
          >
            <ExitFullScreenIcon className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Update openFullscreen function
  const openFullscreen = useCallback((chartId) => {
    setFullscreenChart(chartId)
    // Reinitialize the chart in the fullscreen modal with all features
    setTimeout(() => {
      const config = CHART_CONFIG.find(c => c.containerId === chartId)
      if (!config) return

      // Clean up existing fullscreen chart instance
      if (chartInstancesRef.current["fullscreen_chart"]) {
        try {
          chartInstancesRef.current["fullscreen_chart"].remove()
        } catch (error) {
          console.log('Chart cleanup failed:', error)
        }
        delete chartInstancesRef.current["fullscreen_chart"]
      }

      chartInstancesRef.current["fullscreen_chart"] = new window.TradingView.widget({
        symbol: config.symbol,
        interval: chartSettings[chartId].interval,
        theme: chartSettings[chartId].theme,
        style: "1",
        locale: "en",
        container_id: "fullscreen_chart",
        width: window.innerWidth,
        height: window.innerHeight - 64,
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: chartSettings[chartId].indicators,
        drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
      })
    }, 100) // Increased delay
  }, [chartSettings])

  // Update fullscreen modal in return statement
  return (
    <div className="">
      <div className="relative overflow-hidden rounded-lg border-x border-t border-border bg-black/5">
        <ChartControls containerId={activeChart} />
        <div id={activeChart} className={`${activeChart === "fullscreen_chart" ? "h-[calc(100vh-120px)]" : "h-[calc(100vh-460px)]"} w-full`} />
      </div>

      {fullscreenChart && (
        <div className="fixed inset-0 z-50 bg-black/90">
          <FullscreenChartControls onClose={() => setFullscreenChart(null)} />
          <div className="absolute inset-x-0 bottom-0 top-[64px] w-full">
            <div id="fullscreen_chart" className="size-full" />
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingViewChart
