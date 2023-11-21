"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import getRecentCommit from "../components/getRecentCommit"

const RecentCommitToastComponent = () => {
  const [lastCommit, setLastCommit] = useState(
    "b1b3124d14f666e73c054aa9d0a215e4de857c9c"
  )

  const router = useRouter()

  useEffect(() => {
    const fetchRecentCommit = async () => {
      try {
        const commit = await getRecentCommit("punycode-unicode.converter")
        if (commit !== lastCommit) {
          toast.success("New commit detected!")
          setLastCommit(commit)
        } else {
          toast.message("No new commits detected")
        }
      } catch (error) {
        toast.error("Error Fetching latest commit from GitHub API")
      }
    }

    const interval = setInterval(fetchRecentCommit, 10000)

    fetchRecentCommit() // Initial fetch of recent commit

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <>latest commit: {lastCommit}</>
}

export default RecentCommitToastComponent
