"use client"

import { useState } from "react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "./ui/button"

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(true)

  const ChangeIsOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <DropdownMenu className="relative hover:cursor-pointer">
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          onClick={ChangeIsOpen}
          className="hover:cursor-pointer"
        >
          Projects
        </Button>
      </DropdownMenuTrigger>
      <Link href="/tradingview-script" className="hover:cursor-pointer">
        <DropdownMenuContent className="hover:cursor-pointer">
          <DropdownMenuItem value="top" className="hover:cursor-pointer">
            {" "}
            Tradingview Script: Auto-Close Ads
          </DropdownMenuItem>
        </DropdownMenuContent>
      </Link>
    </DropdownMenu>
  )
}

export default Dropdown
