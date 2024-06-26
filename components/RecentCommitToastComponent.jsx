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
      const commit = await getRecentCommit("punycode-unicode.converter")
      if (!lastCommit) {
        toast("!lastCommit")
        setLastCommit(commit)
        return
      }

      if (lastCommit === commit) {
        toast("No new commits")
        return
      }

      if (lastCommit !== commit) {
        toast("New commit detected")
        setLastCommit(commit)
      }
    }

    const interval = setInterval(fetchRecentCommit, 30000)

    fetchRecentCommit() // Initial fetch of recent commit

    return () => {
      clearInterval(interval)
    }
  }, [lastCommit])

  return <>latest commit: {lastCommit}</>
}

export default RecentCommitToastComponent
