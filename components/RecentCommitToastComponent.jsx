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
      try {
        const commit = await getRecentCommit("punycode-unicode.converter")
        if (!lastCommit) {
          setLastCommit(commit)
        }

        if (lastCommit !== commit) {
          toast.success(`New commit detected! ${commit}`)
          setLastCommit(commit)
          router.reload()
        } else {
          toast.message("No new commit detected")
        }
      } catch (error) {
        console.error(error)
        toast.error("Error fetching recent commit")
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
