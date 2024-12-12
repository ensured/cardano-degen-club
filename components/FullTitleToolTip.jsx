"use client"

import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const FullTitleToolTip = ({ children, title, url }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCloseToolTip = () => {
    setIsOpen(false)
  }

  const handleOpenChange = () => {
    setIsOpen(!isOpen)
  }

  return (
    <TooltipProvider delayDuration={650}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          className="flex w-full select-none flex-col items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault()
            handleCloseToolTip()
          }}
        >
          <p className="">{title}</p>
          <p className="">{url}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FullTitleToolTip
