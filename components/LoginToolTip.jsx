"use client"

import { useEffect, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const LoginToolTip = ({ children }) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  if (isPageLoaded) {
    return (
      <TooltipProvider skipDelayDuration={0} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent>
            <p>Login</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
}

export default LoginToolTip
