"use client"

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
  return (
    <DropdownMenu className="relative">
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"sm"}>
          {" "}
          Projects
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href="/tradingview-script">
          <DropdownMenuItem value="top">
            {" "}
            Tradingview Script: Auto-Close Ads
          </DropdownMenuItem>
        </Link>
        <Link href="/">
          <DropdownMenuItem value="top"> Punycode Converter</DropdownMenuItem>
        </Link>
        <Link href="/cardano-links">
          <DropdownMenuItem value="top">Cardano Links</DropdownMenuItem>
        </Link>
        <Link href="/recipe-finder">
          <DropdownMenuItem value="top">Recipe Finder</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
