"use client"

import { useState } from "react"
import Link from "next/link"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Menu } from "lucide-react"

import { SheetContent } from "./SheetContent"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { SelectSeparator } from "./ui/select"
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet"

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
        <div className="py-2">
          <VisuallyHidden.Root>
            <SheetTitle className="flex w-full justify-center text-xl font-bold">
              null
            </SheetTitle>
          </VisuallyHidden.Root>
          <div className="absolute left-4 top-4">
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
            Scripts/Apps
          </div>

          <Link
            className="flex gap-1 py-2 text-lg"
            target="_blank"
            href={"https://github.com/ensured/phone-backup-app-android"}
            onClick={handleOpenChange}
          >
            Phone backup app (Android)
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
            href="/recipe-fren"
            onClick={handleOpenChange}
            className="py-1 text-lg"
          >
            Recipe Fren
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
        <VisuallyHidden.Root>
          <SheetDescription>Description</SheetDescription>
        </VisuallyHidden.Root>
      </SheetContent>
    </Sheet>
  )
}
