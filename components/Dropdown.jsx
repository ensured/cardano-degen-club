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

import FeedBackDrawer from "./FeedbackClient"
import { Button } from "./ui/button"

const Dropdown = () => {
  const handleIagonLinkClick = () => {
    const url = "https://github.com/ensured/iagon-node-status-webapp"
    window.open(url, "_blank")
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"sm"}>
          {" "}
          Projects
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-moon dark:text-cardano">
          Crypto
        </DropdownMenuLabel>

        <Link href="/punycode">
          <DropdownMenuItem> Punycode Converter</DropdownMenuItem>
        </Link>

        <Link href="/cardano-links">
          <DropdownMenuItem>Cardano Links</DropdownMenuItem>
        </Link>

        <Link href="/crypto-tracker">
          <DropdownMenuItem>Crypto Tracker</DropdownMenuItem>
        </Link>
        <Link href="/recipe-finder">
          <DropdownMenuItem>Recipe Finder</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />

        {/* <Link href="/breakout">
          <DropdownMenuItem value="top">Breakout Game</DropdownMenuItem>
        </Link> */}
        <DropdownMenuLabel className="text-moon dark:text-cardano">
          Scripts
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleIagonLinkClick}>
          Iagon Node Status Webapp
        </DropdownMenuItem>
        <Link href="/tradingview-script">
          <DropdownMenuItem value="top">
            {" "}
            Tradingview Script: Auto-Close Ads
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
