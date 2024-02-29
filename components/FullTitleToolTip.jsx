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
  const [offset, setOffset] = useState(0)
  const tooltipRef = useRef(null)

  useEffect(() => {
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

        // Calculate offset based on title length
        const titleLengthOffset = Math.min(title.length * 5, 100) // Adjust multiplier and maximum offset as needed

        if (isCloseToTop) {
          setSide("bottom")
          setOffset(titleLengthOffset)
        } else {
          const cardMidPoint = cardRect.top + cardRect.height / 2
          const windowMidPoint = window.innerHeight / 2

          const newSide = cardMidPoint < windowMidPoint ? "bottom" : "top"
          setSide(newSide)
          setOffset(0)
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
  }, [title])

  return (
    <TooltipProvider skipDelayDuration={0} delayDuration={0}>
      <Tooltip>
        <TooltipTrigger ref={tooltipRef}>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={offset}
          side={side}
          className={`absolute transform -translate-x-1/2 left-1/2 -bottom-full md:-bottom-full max-w-[900px]`}
        >
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FullTitleToolTip
