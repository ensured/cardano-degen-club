"use client"

import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Dropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Projects</DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* <DropdownMenuLabel>tradingview console script</DropdownMenuLabel> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem>
          <Link href="/tradingview-script">
            Tradingview Script: Auto-Close Ads
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
