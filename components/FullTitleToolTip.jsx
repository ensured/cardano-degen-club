"use client"

import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const FullTitleToolTip = ({ children, title }) => {
  const [side, setSide] = useState("top")
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        calculateSide()
      }

      const handleScroll = () => {
        calculateSide()
      }

      const calculateSide = () => {
        if (tooltipRef.current) {
          const cardRect = tooltipRef.current.getBoundingClientRect()
          const distanceFromTop = cardRect.top
          const isCloseToTop = distanceFromTop < 50

          if (isCloseToTop) {
            setSide("bottom")
          } else {
            const cardMidPoint = cardRect.top + cardRect.height / 2
            const windowMidPoint = window.innerHeight / 2

            const newSide = cardMidPoint < windowMidPoint ? "bottom" : "top"
            setSide(newSide)
          }
        }
      }

      calculateSide()

      window.addEventListener("resize", handleResize)
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [title])

  return (
    <TooltipProvider skipDelayDuration={0} delayDuration={0}>
      <Tooltip>
        <TooltipTrigger ref={tooltipRef}>{children}</TooltipTrigger>
        <TooltipContent side={side} className="select-none">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FullTitleToolTip
