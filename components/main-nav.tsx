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
    }, 10000) // Update every minute

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
      <Skeleton className="mt-0.5 flex h-5 w-24 items-center justify-center">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </Skeleton>
    ) : (
      <span className="text-sm text-muted-foreground">
        {latestRepoCommit[0]?.date ? (
          <Dialog>
            <DialogTrigger>
              <div className="flex cursor-pointer items-center gap-x-1">
                <div className="font-mono text-xs tracking-tighter">
                  ({timeAgo(latestRepoCommit[0]?.date)} ago)
                </div>
                {width && width > 600 && (
                  <div className="font-mono text-xs tracking-tighter">
                    {latestRepoCommit[0]?.message}
                  </div>
                )}
                <div
                  className="size-3.5 rounded-full opacity-60 dark:opacity-[69%]"
                  style={{
                    backgroundColor: getColor(latestRepoCommit[0]?.date),
                  }}
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                <VisuallyHidden>yeet</VisuallyHidden>
              </DialogTitle>
              <Card className="flex items-center gap-4 rounded-md bg-background p-4 shadow-md">
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {latestRepoCommit[0]?.message ||
                      "No commit message available."}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {timeAgo(latestRepoCommit[0]?.date) + " ago" ||
                      "No date available."}
                  </CardDescription>
                </div>
                <CardContent className="text-sm text-muted-foreground">
                  <Link
                    href={`https://github.com/ensured/${latestRepoCommit[0]?.repo}`}
                    className="text-sky-600 underline hover:text-sky-800"
                    target="_blank"
                  >
                    Visit Repository
                  </Link>
                </CardContent>
              </Card>
              <DialogFooter>
                <DialogClose>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          ""
        )}
      </span>
    )
  }

  return (
    <Link
      href="/"
      target="_blank"
      className="flex items-center rounded-full transition-all duration-100 hover:bg-zinc-500/10"
    >
      <Icons.ada className="size-8 md:size-10" />
      <div className="mx-2 flex items-center gap-1 sm:mx-3">
        {latestCommit()}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    </Link>
  )
}
