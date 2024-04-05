import React, { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { CSSTransition } from "react-transition-group"

const ScrollTooltip = ({ currentCardIndex, totalCards }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [trigger, setTrigger] = useState(false)

  useEffect(() => {
    setShowTooltip(true) // Show tooltip when totalCards changes
    setTrigger(true) // Trigger CSS transition
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0
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
      classNames="zoom-tooltip"
      unmountOnExit
      onExited={() => setTrigger(false)} // Reset trigger state after animation
    >
      <div className="fixed inset-x-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-inner shadow-sky-500/80">
        <div className="flex text-sm transition-opacity duration-500">
          <div>{currentCardIndex}</div>/<div>{totalCards}</div>
        </div>
      </div>
    </CSSTransition>
  )
}

export default ScrollTooltip
