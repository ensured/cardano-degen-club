"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { SheetClose, SheetContent } from "./SheetContent"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { SelectSeparator } from "./ui/select"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

export function HeaderNavSheet() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleOpenChange = () => {
    setIsSheetOpen(!isSheetOpen)
  }

  return (
    <Sheet key={"left"} open={isSheetOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="py-1">
          <div className="absolute left-4 top-[0.84rem]">
            <ThemeToggle />
          </div>
        </div>

        <div className="relative mt-6 flex h-full flex-col gap-1 overflow-auto pb-4">
          <SelectSeparator />
          <div className="py-2 text-2xl font-semibold text-sky-500">Crypto</div>

          <Link
            href="/punycode"
            onClick={handleOpenChange}
            className="py-1 text-lg"
          >
            Punycode Converter
          </Link>
          <Link
            className="py-1 text-lg"
            href="/cardano-links"
            onClick={handleOpenChange}
          >
            Cardano Links
          </Link>
          <Link
            className="py-1 text-lg"
            href="/crypto-tracker"
            onClick={handleOpenChange}
          >
            Crypto Tracker
          </Link>
          <SelectSeparator />

          <div className="py-2 text-2xl font-semibold text-sky-500">
            Scripts
          </div>
          <Link
            className="flex gap-1 py-2 text-lg"
            target="_blank"
            href={"https://github.com/ensured/iagon-node-status-webapp"}
            onClick={handleOpenChange}
          >
            Iagon Node Status Webapp
          </Link>
          <Link
            href="/tradingview-script"
            onClick={handleOpenChange}
            className="py-1 text-lg"
          >
            {" "}
            Tradingview Script: Auto-Close Ads
          </Link>
          <SelectSeparator />

          <div className="py-2 text-2xl font-semibold text-sky-500">Misc</div>
          <Link
            href="/recipe-finder"
            onClick={handleOpenChange}
            className="flex flex-row items-center gap-2 py-1 text-lg"
          >
            <Image
              src={"/RecipeVaultLogo.jpg"}
              height={33}
              width={33}
              className="rounded-md"
              alt="FlavorSavor logo"
            />
            Recipe Vault
          </Link>
          <Link
            href="/port-checker"
            onClick={handleOpenChange}
            className="py-1 text-lg"
          >
            <span>Port Checker</span>
          </Link>
          <SelectSeparator />
        </div>

        {/* <SheetHeader></SheetHeader> */}
      </SheetContent>
    </Sheet>
  )
}
