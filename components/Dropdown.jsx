"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import FeedBackDrawer from "./Feedback"
import { Button } from "./ui/button"

const Dropdown = () => {
  const handleIagonLinkClick = () => {
    const url = "https://github.com/ensured/iagon-node-status-webapp"
    window.open(url, "_blank")
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          {" "}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="dark:text-cardano text-moon">
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

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="dark:text-cardano text-moon">
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
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="dark:text-cardano text-moon">
          Misc
        </DropdownMenuLabel>
        <Link href="/recipe-finder">
          <DropdownMenuItem>Recipe Finder</DropdownMenuItem>
        </Link>
        <Link href="/port-checker">
          <DropdownMenuItem value="top">
            <div className="flex flex-col justify-center">
              <span>Port Checker</span>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
