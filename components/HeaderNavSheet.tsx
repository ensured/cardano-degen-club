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
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet"
import { useCommits } from "./CommitContext"
import { timeAgoCompact } from "../lib/helper"
import { Separator } from "./ui/separator"
import { useTheme } from "next-themes"

export function HeaderNavSheet() {
  const { folderCommits, latestRepoCommit, loading, error } = useCommits()

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleOpenChange = () => {
    setIsSheetOpen(!isSheetOpen)
  }

  const { theme } = useTheme()

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
          <Separator className="my-1" />
          <div className="text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">
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
                    ?.lastCommitDate
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
                    ?.lastCommitDate
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

          <CustomLink
            href={"/adahandle"}
            onClick={handleOpenChange}
            target={false}
          >
            <div className="flex">
              <a href="/">
                <h1 className="flex items-center text-lg no-underline">
                  <span className="sr-only">ADA Handle</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="62"
                    height="20"
                    viewBox="0 7 120 41"
                  >
                    <path
                      id="logo_S"
                      data-name="logo S"
                      d="M6.847,2.28q0-.819,1.269-1.531A6.543,6.543,0,0,1,11.458,0q1.6,0,2.071.713a1.691,1.691,0,0,1,.333.926V2.707a11.626,11.626,0,0,1,5.245,1.5c.4.284.6.558.6.818a10.97,10.97,0,0,1-.835,3.988q-.8,2.137-1.568,2.138a4.05,4.05,0,0,1-.869-.321A9.124,9.124,0,0,0,12.76,9.793a4.669,4.669,0,0,0-1.97.284.954.954,0,0,0-.5.891c0,.38.246.678.735.891a10.607,10.607,0,0,0,1.8.569,12.063,12.063,0,0,1,2.372.749,13.116,13.116,0,0,1,2.4,1.281A5.632,5.632,0,0,1,19.442,16.7a6.6,6.6,0,0,1,.735,2.991,10.022,10.022,0,0,1-.268,2.528,7.742,7.742,0,0,1-.936,2.065A5.961,5.961,0,0,1,17,26.206a9.615,9.615,0,0,1-3.141,1.212v.569q0,.819-1.269,1.531a6.531,6.531,0,0,1-3.34.747q-1.6,0-2.071-.711a1.7,1.7,0,0,1-.335-.926V27.56a21.3,21.3,0,0,1-3.775-.676Q0,25.995,0,24.961a16.977,16.977,0,0,1,.534-4.13q.535-2.172,1.269-2.173.133,0,2.772.962a12.92,12.92,0,0,0,3.976.962,3.425,3.425,0,0,0,1.736-.284,1.077,1.077,0,0,0,.4-.891c0-.38-.246-.7-.735-.962a6.491,6.491,0,0,0-1.838-.676A15.515,15.515,0,0,1,3.34,15.74a5.472,5.472,0,0,1-1.836-2.1A6.823,6.823,0,0,1,.768,10.4q0-6.553,6.079-7.655Z"
                      transform="translate(0 9.487)"
                      fill="#0cd15b"
                    ></path>
                    <text
                      id="Handle.me"
                      transform="translate(23 38)"
                      fill={theme === "dark" ? "#fff" : "#000"}
                      font-size="34"
                      font-family="NotoSans-Bold, Noto Sans"
                      font-weight="700"
                    >
                      <tspan x="0" y="0">
                        handle
                      </tspan>
                    </text>
                  </svg>
                </h1>
              </a>
            </div>

            <CustomLinkText className="font-bold dark:text-white">
              Checker
            </CustomLinkText>
            {folderCommits.find((c) => c.folder === "adahandle") && (
              <span className="ml-auto text-xs text-gray-500 sm:text-sm">
                (
                {timeAgoCompact(
                  folderCommits.find((c) => c.folder === "adahandle")
                    ?.lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>

          <div className="flex items-center gap-1.5 py-2 text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">
            Scripts/Apps
          </div>

          <CustomLink
            href={"https://github.com/ensured/phone-backup-app-android"}
            onClick={handleOpenChange}
            target={true}
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
                    ?.lastCommitDate
                )}
                )
              </span>
            )}
          </CustomLink>

          <div className="py-2 text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">
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
                    ?.lastCommitDate
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
                    ?.lastCommitDate
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
  target = false,
}: {
  children: React.ReactNode
  href: string
  onClick: () => void
  target?: boolean
}) {
  return (
    <Link
      className="flex items-center gap-2 rounded-md border border-secondary/50 bg-secondary/20 p-2 text-lg"
      href={href}
      onClick={(e) => {
        if (target) {
          e.preventDefault()
          window.open(href, "_blank")
          return
        }
        onClick()
      }}
      target={target ? "_blank" : undefined}
    >
      {children}
    </Link>
  )
}

function CustomLinkText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`text-sm sm:text-base md:text-lg ${className}`}>
      {children}
    </span>
  )
}
