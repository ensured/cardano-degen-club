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
      setIsNearBottom(scrolled > scrollableDistance - 100) // Check if near bottom
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
        behavior: "auto",
      })
  }

  return (
    <button
      className={`duration-250 fixed bottom-4 right-4 z-50 rounded-full p-2 outline-none transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${
        isNearBottom ? "translate-y-[-55px]" : ""
      } bg-zinc-950 text-white shadow-[inset_0px_0px_1px_1px_#553C9A] hover:bg-zinc-900 hover:text-white focus:outline-none`}
      onClick={scrollToTop}
    >
      <ChevronUp />
    </button>
  )
}

export default ScrollToTopButton
