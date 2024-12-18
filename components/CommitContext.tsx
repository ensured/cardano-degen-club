"use client"
import React, { createContext, useContext, useEffect, useState } from "react"

interface CommitContextType {
  folderCommits: any[]
  latestRepoCommit: any[]
  loading: boolean
  error: string | null
}

const CommitContext = createContext<CommitContextType | undefined>(undefined)

export const dynamic = "force-dynamic"

export const CommitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [folderCommits, setFolderCommits] = useState<any[]>([])
  const [latestRepoCommit, setLatestRepoCommit] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCommits() {
      setLoading(true)
      try {
        const response = await fetch("/api/last-commits")
        const data = await response.json()

        if (response.ok) {
          const flattenedCommits = data.folderCommits.flat()
          setFolderCommits(flattenedCommits)
          setLatestRepoCommit(data.latestRepoCommit)
        } else {
          throw new Error(data.error || "Unknown error occurred.")
        }
      } catch (err) {
        console.error("Error fetching commits:", err)
        setError("Failed to load github commits")
      } finally {
        setLoading(false)
      }
    }

    fetchCommits()

    // Poll every 10 seconds for updates
    const interval = setInterval(fetchCommits, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CommitContext.Provider
      value={{ folderCommits, latestRepoCommit, loading, error }}
    >
      {children}
    </CommitContext.Provider>
  )
}

export const useCommits = () => {
  const context = useContext(CommitContext)
  if (context === undefined) {
    throw new Error("useCommits must be used within a CommitProvider")
  }
  return context
}
