'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getLeaderboard } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'
import { eventEmitter } from '@/lib/eventEmitter'
import { Skeleton } from './ui/skeleton'
import Link from 'next/link'

type LeaderboardEntry = {
  username: string
  score: number
  created_at: string
  updated_at: string
}

export const Leaderboard = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const { walletState } = useWallet()

  const fetchLeaderboard = async () => {
    try {
      const result = await getLeaderboard()
      if (result.success) {
        setScores(result.data as LeaderboardEntry[])
      } else {
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard()

    // Listen for score updates
    const handleScoreUpdate = () => {
      fetchLeaderboard()
    }

    eventEmitter.on('SCORE_UPDATED', handleScoreUpdate)

    // Cleanup
    return () => {
      eventEmitter.off('SCORE_UPDATED', handleScoreUpdate)
    }
  }, [])

  const formatStakeAddress = (address: string) => {
    if (!address) return ''
    if (address.length <= 16) return address
    return `${address.slice(0, 9)}...${address.slice(-9)}`
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border p-2">
        {/* 15 rows of skeletons each 20px high */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    )

  return (
    <div className="w-full">
      {(walletState?.adaHandle?.handle || walletState?.walletAddress) &&
        walletState.network === 1 && (
          <div className="h-[430px] rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scores.map((entry, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-muted-foreground hover:underline">
                      <Link href={`https://pool.pm/${entry.username}`} target="_blank">
                        {formatStakeAddress(entry.username)}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {entry.score}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {new Date(entry.updated_at || entry.created_at).toLocaleDateString('en-US', {
                        year: '2-digit',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
