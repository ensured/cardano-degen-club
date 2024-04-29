import React, { useEffect, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"

const ScrollTooltip = ({ currentCardIndex, totalCards, totalResults }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const MIN_VISIBILITY_THRESHOLD = 100
    if (window.scrollY > MIN_VISIBILITY_THRESHOLD) {
      setShowTooltip(true)
    } else {
      setShowTooltip(false)
    }
    const handleScroll = () => {
      const isScrolled = window.scrollY > MIN_VISIBILITY_THRESHOLD
      setShowTooltip(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [totalCards])

  return (
    <CSSTransition
      in={showTooltip}
      timeout={50}
      classNames="zoom-tooltip pointer-events-none"
      unmountOnExit
      nodeRef={tooltipRef}
    >
      <div className="fixed inset-x-2 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-xs text-white shadow-inner shadow-sky-500/80">
        {currentCardIndex}/{totalCards} {/* /{totalResults} */}
      </div>
    </CSSTransition>
  )
}

export default ScrollTooltip
