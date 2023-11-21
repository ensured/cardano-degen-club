"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import getRecentCommit from "../components/getRecentCommit"

const RecentCommitToastComponent = () => {
  const [lastCommit, setLastCommit] = useState("")

  const router = useRouter()

  useEffect(() => {
    const fetchRecentCommit = async () => {
      try {
        const commit = await getRecentCommit("punycode-unicode.converter")
        if (lastCommit !== "" && lastCommit !== commit) {
          toast.success("New update available! Reload to see changes.")
          setTimeout(() => {
            toast.success("Reloading page...")
            router.reload()
          }, 5000)
        }
        setLastCommit(commit)
      } catch (error) {
        toast.error("Error fetching recent commit from GitHub API")
      }
    }

    const interval = setInterval(fetchRecentCommit, 15000)

    fetchRecentCommit() // Initial fetch of recent commit

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <>latest commit: {lastCommit}</>
}

export default RecentCommitToastComponent