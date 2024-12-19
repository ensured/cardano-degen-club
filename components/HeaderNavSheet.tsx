"use client"

import { useState } from "react"
import Link from "next/link"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import {
  Menu,
  Globe,
  Link as LinkIcon,
  LineChart,
  Smartphone,
  Monitor,
  UtensilsCrossed,
  Network,
  Loader2,
} from "lucide-react"

import { SheetContent } from "./SheetContent"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { SelectSeparator } from "./ui/select"
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet"
import { useCommits } from "./CommitContext"
import { timeAgoCompact } from "../lib/helper"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export function HeaderNavSheet() {
  const { folderCommits, latestRepoCommit, loading, error } = useCommits()

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleOpenChange = () => {
    setIsSheetOpen(!isSheetOpen)
  }

  return (
    <Sheet key={"left"} open={isSheetOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="flex items-center transition duration-200"
          >
            <Menu className="text-lg" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="p-3">
        <div className="flex flex-row gap-1">
          <ThemeToggle />
          <div className="flex w-4/5 flex-col items-center justify-center gap-1">
            {error && (
              <span className="text-sm text-gray-500">
                <span className="text-red-500">{error}</span>
              </span>
            )}
            {loading && <Loader2 className="animate-spin" />}
          </div>
        </div>

        <VisuallyHidden.Root>
          <SheetTitle className="flex w-full justify-center text-xl font-bold">
            null
          </SheetTitle>
        </VisuallyHidden.Root>

        <div className="relative flex h-full flex-col gap-1 overflow-auto pb-4">
          <SelectSeparator className="my-2" />
          <div className="text-xl font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)]">
            Crypto
          </div>

          <CustomLink href="/punycode" onClick={handleOpenChange}>
            <Globe className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Punycode Converter</CustomLinkText>
            {folderCommits.find((c) => c.folder === "punycode") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "punycode")
                    .lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>
          <CustomLink href="/cardano-links" onClick={handleOpenChange}>
            <LinkIcon className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Cardano Links</CustomLinkText>
            {folderCommits.find((c) => c.folder === "cardano-links") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "cardano-links")
                    .lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>
          <CustomLink href="/crypto-tracker" onClick={handleOpenChange}>
            <LineChart className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Crypto Tracker</CustomLinkText>
            {folderCommits.find((c) => c.folder === "crypto-tracker") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "crypto-tracker")
                    ?.lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>

          <div className="flex items-center gap-1.5 py-2 font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)] sm:text-xl">
            Scripts/Apps
          </div>

          <CustomLink
            href={"https://github.com/ensured/phone-backup-app-android"}
            onClick={handleOpenChange}
          >
            <Smartphone className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Android Fren</CustomLinkText>
            {latestRepoCommit[1] && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                ({timeAgoCompact(latestRepoCommit[1].date)})
              </span>
            )}
          </CustomLink>
          <CustomLink href="/tradingview-script" onClick={handleOpenChange}>
            <Monitor className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>TradingView Adblocker</CustomLinkText>
            {folderCommits.find((c) => c.folder === "tradingview-script") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "tradingview-script")
                    .lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>

          <div className="py-2 text-xl font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)]">
            Misc
          </div>
          <CustomLink href="/recipe-fren" onClick={handleOpenChange}>
            <UtensilsCrossed className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Recipe Fren</CustomLinkText>
            {folderCommits.find((c) => c.folder === "recipe-fren") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "recipe-fren")
                    .lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>
          <CustomLink href="/port-checker" onClick={handleOpenChange}>
            <Network className="size-5 min-h-[24px] min-w-[24px] text-lg sm:text-base" />
            <CustomLinkText>Port Checker</CustomLinkText>
            {folderCommits.find((c) => c.folder === "port-checker") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "port-checker")
                    .lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>
        </div>

        <VisuallyHidden.Root>
          <SheetDescription>Description</SheetDescription>
        </VisuallyHidden.Root>
      </SheetContent>
    </Sheet>
  )
}

function CustomLink({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode
  href: string
  onClick: () => void
}) {
  return (
    <Link
      className="flex items-center gap-2 rounded-md border border-secondary/50 bg-secondary/20 p-2 text-lg"
      href={href}
      onClick={onClick}
      target="_blank"
    >
      {children}
    </Link>
  )
}

function CustomLinkText({ children }: { children: React.ReactNode }) {
  return <span className="text-sm sm:text-base md:text-lg">{children}</span>
}
