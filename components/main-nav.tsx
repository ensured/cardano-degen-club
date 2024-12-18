"use client";
import Link from "next/link"
import { Icons } from "@/components/icons"
import { useCommits } from "./CommitContext";
import { timeAgo } from "@/utils/timeAgo";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function MainNav() {
  const { folderCommits, latestRepoCommit, loading, error } = useCommits();

  const date = latestRepoCommit[0]?.date

  // Function to interpolate color based on time difference
  const getColor = (date: any) => {
    const now = Date.now(); // Get the current time in milliseconds
    const commitTime = date ? new Date(date) : new Date(); // Fallback to current date if date is invalid
    const timeDiff = (now - commitTime.getTime()) / 1000; // time difference in seconds

    // Define the maximum time for color mapping (1 year in seconds)
    const maxTime = 365 * 24 * 60 * 60; // 1 year in seconds

    // Normalize timeDiff to a value between 0 and 1
    const normalized = Math.min(timeDiff / maxTime, 1);

    // Interpolate between green (0) and red (1)
    const r = Math.floor(255 * normalized); // Red increases with time
    const g = Math.floor(255 * (1 - normalized)); // Green decreases with time
    const b = 0; // Keep blue constant

    return `rgb(${r}, ${g}, ${b})`; // Return the RGB color
  };

  const latestCommit = ()=> {
    return loading ? <Skeleton className="h-5 w-16" /> : <span style={{ color: date ? getColor(date) : '' }}>
    {date ? <div className="flex items-center gap-0.5">
      ({timeAgo(date)} ago)
     </div> : ''}
  </span>
  }


  return (
    <Link
      href="/"
      className="flex items-center gap-1 rounded-full transition-all duration-100 hover:bg-zinc-500/10"
    >
      <Icons.ada className="size-8 p-0.5 md:size-10" />
        {latestCommit()}
        {error && <div className="text-xs text-red-500">{error}</div>}
    </Link>
  )
}
