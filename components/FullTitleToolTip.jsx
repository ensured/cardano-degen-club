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
    const handleResize = () => {
      calculateSide()
    }

    const calculateSide = () => {
      if (tooltipRef.current) {
        const cardRect = tooltipRef.current.getBoundingClientRect()
        const cardMidPoint = cardRect.top + cardRect.height / 2
        const windowMidPoint = window.innerHeight / 2

        // Adjust the threshold as needed
        const newSide = cardMidPoint < windowMidPoint ? "bottom" : "top"
        setSide(newSide)
      }
    }

    calculateSide() // Call it once to set the initial side

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, []) // Empty dependency array ensures it only runs on mount and unmount

  return (
    <TooltipProvider skipDelayDuration={0} delayDuration={0}>
      <Tooltip>
        <TooltipTrigger ref={tooltipRef}>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="absolute transform -translate-x-1/2 left-1/2 -bottom-full md:-bottom-full max-w-[900px]"
        >
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FullTitleToolTip
