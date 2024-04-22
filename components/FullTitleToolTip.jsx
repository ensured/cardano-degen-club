"use client"

import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const FullTitleToolTip = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCloseToolTip = () => {
    setIsOpen(false)
  }

  const handleOpenChange = () => {
    setIsOpen(!isOpen)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          className="select-none"
          onClick={(e) => {
            e.preventDefault()
            handleCloseToolTip()
          }}
        >
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FullTitleToolTip
