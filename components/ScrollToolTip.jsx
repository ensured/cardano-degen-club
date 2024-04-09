import React, { useEffect, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"

const ScrollTooltip = ({ currentCardIndex, totalCards }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [trigger, setTrigger] = useState(false)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const MIN_VISIBILITY_THRESHOLD = 100
    if (window.scrollY > MIN_VISIBILITY_THRESHOLD) {
      setShowTooltip(true)
    } else {
      setShowTooltip(false)
    }
    setTrigger(true) // Trigger CSS transition
    const handleScroll = () => {
      const isScrolled = window.scrollY > MIN_VISIBILITY_THRESHOLD
      setShowTooltip(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [totalCards]) // Re-run effect whenever totalCards changes

  return (
    <CSSTransition
      in={showTooltip}
      timeout={200}
      classNames="zoom-tooltip pointer-events-none"
      unmountOnExit
      onExited={() => setTrigger(false)} // Reset trigger state after animation
      nodeRef={tooltipRef} // Add ref to the CSSTransition
    >
      <div
        ref={tooltipRef} // Add ref to the div
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-inner shadow-sky-500/80"
      >
        <div className="pointer-events-noneflex text-sm transition-opacity duration-500">
          {currentCardIndex}/{totalCards}
        </div>
      </div>
    </CSSTransition>
  )
}

export default ScrollTooltip
