"use client"

import { useEffect, useState } from "react"
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

export function HeaderNavSheet() {
  const { folderCommits, latestRepoCommit, loading, error } = useCommits();

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleOpenChange = () => {
    setIsSheetOpen(!isSheetOpen)
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}Y`;
    if (months > 0) return `${months}M`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    if (seconds > 0) return `~${seconds}s`;
    return 'just now';
  }

  return (
    <Sheet key={"left"} open={isSheetOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
       <div className="flex items-center">
       <Button variant="outline" size="icon" className="flex items-center transition duration-200">
          <Menu className="text-lg" />
        </Button>
       </div>
      </SheetTrigger>
      <SheetContent className="">
        <div className="relative -top-2 right-2">
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-2 pr-8">
          {error && (
            <span className="text-sm text-gray-500">
              <span className="text-red-500">{error}</span>
            </span>
          )}
          {loading && (
              <Loader2 className="animate-spin" />
          )}
          </div>
          
          <VisuallyHidden.Root>
            <SheetTitle className="flex w-full justify-center text-xl font-bold">
              null
            </SheetTitle>
          </VisuallyHidden.Root>
      
      

        <div className="relative flex h-full flex-col gap-1 overflow-auto pb-4"> 
        <SelectSeparator />
          <div className="text-xl font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)]">Crypto</div>

          <Link
            href="/punycode"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <Globe className="size-5" />
            Punycode Converter
            {folderCommits.find(c => c.folder === "punycode") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(folderCommits.find(c => c.folder === "punycode").lastCommitDate)})
              </span>
            )}
        
          </Link>
          <Link
            className="flex items-center gap-2 py-1 text-lg"
            href="/cardano-links"
            onClick={handleOpenChange}
          >
            <LinkIcon className="size-5" />
            Cardano Links
            {folderCommits.find(c => c.folder === "cardano-links") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(folderCommits.find(c => c.folder === "cardano-links").lastCommitDate)})
              </span>
            )}
          </Link>
          <Link
            className="flex items-center gap-2 py-1 text-lg"
            href="/crypto-tracker"
            onClick={handleOpenChange}
          >
            <LineChart className="size-5" />
            Crypto Tracker
            {folderCommits.find(c => c.folder === "crypto-tracker") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(
                  folderCommits.find(c => c.folder === "crypto-tracker")?.lastCommitDate
                )})
              </span>
            )}
          </Link>
          <SelectSeparator />

          <div className="py-2 text-xl font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)]">
            Scripts/Apps
          </div>

          <Link
            className="flex items-center gap-2 py-2 text-lg"
            target="_blank"
            href={"https://github.com/ensured/phone-backup-app-android"}
            onClick={handleOpenChange}
          >
            <Smartphone className="size-5" />
            Phone backup app (Android)
            {latestRepoCommit[1] && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(latestRepoCommit[1].date)})
              </span>
            )}
          </Link>
          <Link
            href="/tradingview-script"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <Monitor className="size-5" />
            Tradingview Script: Auto-Close Ads
            {folderCommits.find(c => c.folder === "tradingview-script") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(folderCommits.find(c => c.folder === "tradingview-script").lastCommitDate)})
              </span>
            )}
          </Link>
          <SelectSeparator />

          <div className="py-2 text-xl font-semibold text-[hsl(276,70%,40)] dark:text-[hsl(276,70%,60%)]">Misc</div>
          <Link
            href="/recipe-fren"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <UtensilsCrossed className="size-5" />
            Recipe Fren
            {folderCommits.find(c => c.folder === "recipe-fren") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(folderCommits.find(c => c.folder === "recipe-fren").lastCommitDate)})
              </span>
            )}
          </Link>
          <Link
            href="/port-checker"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <Network className="size-5" />
            <span>Port Checker</span>
            {folderCommits.find(c => c.folder === "port-checker") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(folderCommits.find(c => c.folder === "port-checker").lastCommitDate)})
              </span>
            )}
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
