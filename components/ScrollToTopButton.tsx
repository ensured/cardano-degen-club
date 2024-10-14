"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollableDistance = documentHeight - windowHeight
      setIsVisible(scrolled > 500) // Show button when scrolled down
      setIsNearBottom(scrolled > scrollableDistance - 40) // Check if near bottom
    }

    // Listen for scroll events
    window.addEventListener("scroll", toggleVisibility)

    // Clear the listener on component unmount
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Handles the animation when scrolling to the top
  const scrollToTop = () => {
    isVisible &&
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
  }

  // Conditionally render the button only when it should be visible
  if (!isVisible || isNearBottom) {
    return null
  }

  return (
    <button
      className="fixed bottom-[3.675rem] right-4 z-50 flex rounded-full bg-zinc-950 p-2 text-white shadow-[inset_0px_0px_1px_1px_#553C9A] outline-none transition-all hover:bg-zinc-900 hover:text-white focus:outline-none"
      onClick={scrollToTop}
    >
      <ChevronUp />
    </button>
  )
}

export default ScrollToTopButton
