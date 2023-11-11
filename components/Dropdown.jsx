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

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <DropdownMenu className="relative hover:cursor-pointer">
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="hover:cursor-pointer">
          Projectsss
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="hover:cursor-pointer">
        <Link
          href="/tradingview-script"
          className="hover:cursor-pointer"
          onClick={closeMenu}
        >
          <DropdownMenuItem value="top" className="hover:cursor-pointer">
            {" "}
            Tradingview Script: Auto-Close Ads
          </DropdownMenuItem>
        </Link>
        <Link href="/" className="hover:cursor-pointer">
          <DropdownMenuItem
            value="top"
            className="hover:cursor-pointer"
            onClick={closeMenu}
          >
            {" "}
            Punycode Converter
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
