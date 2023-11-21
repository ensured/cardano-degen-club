"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import getRecentCommit from "../components/getRecentCommit"

const RecentCommitToastComponent = () => {
  const [lastCommit, setLastCommit] = useState("")
  const [recentCommit, setRecentCommit] = useState("")

  const router = useRouter()

  useEffect(() => {
    // Function to retrieve the recent commit
    const fetchRecentCommit = async () => {
      try {
        const commit = await getRecentCommit("punycode-unicode.converter")
        setRecentCommit(commit)
        if (lastCommit !== "" && lastCommit !== commit) {
          toast.success("New update available! Reload to see changes.")
          setTimeout(() => {
            toast.dismiss()
            toast.success("Reloading page...")
            setTimeout(() => {
              router.reload()
            }, 3000)
            router.refresh()
          }, 30000)
        }
        setLastCommit(commit)
      } catch (error) {
        toast.error("Error fetching recent commit from github api")
      }
    }

    fetchRecentCommit() // Initial fetch of recent commit

    const interval = setInterval(fetchRecentCommit, 120000) // Fetch recent commit every 60 seconds

    return () => clearInterval(interval)
  }, [lastCommit]) // Trigger effect when lastCommit changes

  return <></>
}

export default RecentCommitToastComponent
