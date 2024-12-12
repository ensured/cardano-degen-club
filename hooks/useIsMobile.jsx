"use client";
import { useState } from "react"

import { useWindowSize } from "@uidotdev/usehooks"
import { useEffect } from "react"

const useIsMobile = () => {
    const { width } = useWindowSize()
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
      const checkMobile = () => {
        // Check for touch support as primary indicator
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        
        // Use user agent as secondary check
        const mobileRegex = /Mobile|Android|iPhone|iPad|iPod/i
        const isMobileDevice = mobileRegex.test(navigator.userAgent)
        
        // Consider both screen width and device capabilities
        return hasTouch || isMobileDevice || width < 469
      }
      
      setIsMobile(checkMobile())
    }, [width])
  
    return isMobile
  }

  export default useIsMobile