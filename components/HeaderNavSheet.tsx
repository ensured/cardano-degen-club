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
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { SheetContent } from "./SheetContent"
// import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { SelectSeparator } from "./ui/select"
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet"

export function HeaderNavSheet() {
  const [commits, setCommits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [latestCommitDates, setLatestCommitDates] = useState<any[]>([]);
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    async function fetchCommits() {
      setLoading(true);
      try {
        const response = await fetch("/api/last-commits");
        const data = await response.json();

        if (response.ok) {
          const flattenedCommits = data.commits.flat();
          setCommits(flattenedCommits);
          setLatestCommitDates(data.latestCommitDates);
        } else {
          throw new Error(data.error || "Unknown error occurred.");
        }
      } catch (err) {
        console.error("Error fetching commits:", err);
        setError("Failed to load commit data.");
      } finally {
        setLoading(false);
      }
    }

    fetchCommits();

    // Poll every 10 seconds for updates
    const interval = setInterval(fetchCommits, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateFormattedTime = () => {
      if (latestCommitDates[0]) {
        setFormattedTime(timeAgo(latestCommitDates[0].date));
      }
    };

    updateFormattedTime(); // Initial update
    const interval = setInterval(updateFormattedTime, 1000); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [latestCommitDates]);

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
       <Button variant="outline" className="flex items-center p-2 transition duration-200">
          <Menu className="text-lg" />
        </Button>
       </div>
      </SheetTrigger>
      <SheetContent className="">
        <div className="flex w-full items-center gap-2 pr-8">
          {latestCommitDates[0] && (
            <div className="w-full max-w-md mx-auto px-2 rounded-lg shadow-md">
              <div className="flex flex-col justify-center text-sm text-muted-foreground bg-secondary p-3 rounded-md shadow cursor-pointer mb-2">
                <span className="font-semibold text-lg">Last updated</span>
                <span className="line-clamp-2 w-full text-muted-foreground/60">{formattedTime} ago</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex flex-col justify-center text-sm text-muted-foreground bg-secondary p-3 rounded-md shadow cursor-pointer hover:bg-secondary/80 transition duration-100 hover:text-white hover:outline hover:outline-white/20">
                    <span className="font-semibold text-lg">Commit Message</span>
                    <span className="line-clamp-2 w-full text-muted-foreground/60">{latestCommitDates[0].message}</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-xl font-bold">Full Commit Message</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {latestCommitDates[0].message}
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {error && <span className="text-red-500">{error}</span>}
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </span>
        </div>
        <div>
          
          <VisuallyHidden.Root>
            <SheetTitle className="flex w-full justify-center text-xl font-bold">
              null
            </SheetTitle>
          </VisuallyHidden.Root>
        </div>
        <div className="relative mt-4 flex h-full flex-col gap-1 overflow-auto pb-4"> 
          <SelectSeparator />
  
          <div className="text-2xl font-semibold text-sky-500">Crypto</div>

          <Link
            href="/punycode"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <Globe className="size-5" />
            Punycode Converter
            {commits.find(c => c.folder === "punycode") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "punycode").lastCommitDate)})
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
            {commits.find(c => c.folder === "cardano-links") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "cardano-links").lastCommitDate)})
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
            {commits.find(c => c.folder === "crypto-tracker") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "crypto-tracker").lastCommitDate)})
              </span>
            )}
          </Link>
          <SelectSeparator />

          <div className="py-2 text-2xl font-semibold text-sky-500">
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
            {latestCommitDates[1] && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(latestCommitDates[1].date)})
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
            {commits.find(c => c.folder === "tradingview-script") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "tradingview-script").lastCommitDate)})
              </span>
            )}
          </Link>
          <SelectSeparator />

          <div className="py-2 text-2xl font-semibold text-sky-500">Misc</div>
          <Link
            href="/recipe-fren"
            onClick={handleOpenChange}
            className="flex items-center gap-2 py-1 text-lg"
          >
            <UtensilsCrossed className="size-5" />
            Recipe Fren
            {commits.find(c => c.folder === "recipe-fren") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "recipe-fren").lastCommitDate)})
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
            {commits.find(c => c.folder === "port-checker") && (
              <span className="ml-2 text-sm text-gray-500">
                ({timeAgo(commits.find(c => c.folder === "port-checker").lastCommitDate)})
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
