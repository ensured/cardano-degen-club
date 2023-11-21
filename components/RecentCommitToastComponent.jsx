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
          return // Don't show toast on initial fetch
        }

        if (lastCommit !== commit) {
          toast.success(
            `New commit detected! ${commit}. Reloading in 5 seconds.`
          )
          setLastCommit(commit)
          setTimeout(() => {
            router.reload()
          }, 5000)
        } else {
          toast.message("No new commit detected.")
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

  return <></>
}

export default RecentCommitToastComponent
