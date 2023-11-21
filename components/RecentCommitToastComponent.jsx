"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import getRecentCommit from "../components/getRecentCommit"

const RecentCommitToastComponent = () => {
  const [lastCommit, setLastCommit] = useState(null)

  const router = useRouter()

  useEffect(() => {
    const fetchRecentCommit = async () => {
      const commit = await getRecentCommit("punycode-unicode.converter")
      if (lastCommit === null) {
        toast.message("Saving initial commit to memory state")
        setLastCommit(commit)
      } else if (lastCommit !== commit) {
        setLastCommit(commit)
        toast.success("New commit detected, refreshing page...")
        router.reload()
      } else {
        toast.message("No new commits detected")
      }
    }

    const interval = setInterval(fetchRecentCommit, 30000)

    fetchRecentCommit() // Initial fetch of recent commit

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <>latest commit: {lastCommit}</>
}

export default RecentCommitToastComponent
