import React, { useEffect, useRef, useState } from "react"
import { MAX_FAVORITES } from "@/utils/consts"
import { CSSTransition } from "react-transition-group"

const ScrollTooltip = ({ favorites }) => {
  const [showTooltip, setShowTooltip] = useState(true)

  // useEffect(() => {
  //   const MIN_VISIBILITY_THRESHOLD = 100
  //   if (window.scrollY > MIN_VISIBILITY_THRESHOLD) {
  //     setShowTooltip(true)
  //   } else {
  //     setShowTooltip(false)
  //   }
  //   const handleScroll = () => {
  //     const isScrolled = window.scrollY > MIN_VISIBILITY_THRESHOLD
  //     setShowTooltip(isScrolled)
  //   }

  //   window.addEventListener("scroll", handleScroll)
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll)
  //   }
  // }, [totalCards])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-zinc-900/80 text-xs text-white shadow-inner shadow-sky-500/80">
      {/* {currentCardIndex}/{totalCards}  /{totalResults} */}
      {Object.keys(favorites).length}/{MAX_FAVORITES}
    </div>
  )
}

export default ScrollTooltip
