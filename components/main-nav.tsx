"use client"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { useCommits } from "./CommitContext"
import { timeAgo } from "@/utils/timeAgo"
import { Loader2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useWindowWidth } from "@wojtekmaj/react-hooks"
import { Badge } from "./ui/badge"

export const dynamic = "force-dynamic"

export function MainNav() {
  const { folderCommits, latestRepoCommit, loading, error } = useCommits()
  const width = useWindowWidth()
  // New state to hold the current time
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Effect to update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000) // Update client-side currentTime state every second

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  // Function to interpolate color based on time difference
  const getColor = (date: any) => {
    const commitTime = date ? new Date(date) : new Date() // Fallback to current date if date is invalid
    const timeDiff = (currentTime - commitTime.getTime()) / 1000 // Use currentTime for difference

    // Define the maximum time for color mapping (1 year in seconds)
    const maxTime = 365 * 24 * 60 * 60 // 1 year in seconds

    // Normalize timeDiff to a value between 0 and 1
    const normalized = Math.min(timeDiff / maxTime, 1)

    // Interpolate between green (0) and red (1)
    const r = Math.floor(255 * normalized) // Red increases with time
    const g = Math.floor(255 * (1 - normalized)) // Green decreases with time
    const b = 0 // Keep blue constant

    return `rgb(${r}, ${g}, ${b})` // Return the RGB color
  }

  const latestCommit = () => {
    return loading ? (
      <Skeleton className="flex w-24 items-center justify-center p-1.5 sm:w-44" />
    ) : (
      <span className="text-sm text-muted-foreground">
        {latestRepoCommit[0]?.date ? (
          <Dialog>
            <DialogTrigger>
              <div className="flex cursor-pointer items-center gap-x-1.5 overflow-x-auto rounded-md p-1.5 font-mono hover:bg-secondary">
                <div
                  className="size-3.5 rounded-full opacity-60 dark:opacity-[69%]"
                  style={{
                    backgroundColor: getColor(latestRepoCommit[0]?.date),
                  }}
                />
                <div className="text-xs tracking-tighter">
                  ({timeAgo(latestRepoCommit[0]?.date)} ago)
                </div>
                {width && width > 600 && (
                  <div className="line-clamp-1 max-w-[200px] text-left text-xs tracking-tighter md:max-w-[269px]">
                    {latestRepoCommit[0]?.message}
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogDescription>
                <VisuallyHidden>yeet</VisuallyHidden>
              </DialogDescription>
              <DialogTitle>
                <VisuallyHidden>yeet</VisuallyHidden>
              </DialogTitle>

              <Card className="mx-5 flex flex-col rounded-lg border-none bg-background shadow-lg transition-shadow duration-200 hover:shadow-xl">
                <div className="flex w-full flex-row items-center gap-1 p-1">
                  <CardTitle className="p-1 font-mono text-xl font-semibold tracking-tight">
                    {latestRepoCommit[0]?.message ||
                      "No commit message available."}
                  </CardTitle>
                </div>
                <CardContent className="flex flex-col gap-1 p-2">
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row gap-2">
                      <Button
                        variant={"outline"}
                        className="text-xs sm:text-sm"
                        size={"sm"}
                      >
                        <Link
                          href={`https://github.com/ensured/${latestRepoCommit[0]?.repo}/commit/${latestRepoCommit[0]?.hash}`}
                          target="_blank"
                        >
                          View Commit
                        </Link>
                      </Button>
                      <Button
                        variant={"outline"}
                        className="text-xs sm:text-sm"
                        size={"sm"}
                      >
                        <Link
                          href={`https://github.com/ensured/${latestRepoCommit[0]?.repo}`}
                          target="_blank"
                        >
                          Visit Repository
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <CardDescription className="flex justify-end">
                {timeAgo(latestRepoCommit[0]?.date) + " ago" ||
                  "No date available."}
              </CardDescription>
              {/* <DialogFooter className="relative px-7">
                <DialogClose
                  asChild
                  className="mx-auto flex w-full justify-center"
                >
                  <Button variant="ghost" className="border border-border/40">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter> */}
            </DialogContent>
          </Dialog>
        ) : (
          ""
        )}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Link
        href="/"
        className="flex items-center rounded-full transition-all duration-100 hover:bg-zinc-500/10"
      >
        <Icons.ada className="size-8 md:size-10" />
      </Link>

      <div className="mx-2 flex items-center gap-1 sm:mx-3">
        {latestCommit()}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </div>
  )
}
