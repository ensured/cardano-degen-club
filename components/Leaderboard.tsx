'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getLeaderboard } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'

type LeaderboardEntry = {
  username: string
  score: number
  created_at: string
}

const Leaderboard = () => {
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
    fetchLeaderboard()
  }, [])

  const formatStakeAddress = (address: string) => {
    if (!address) return ''
    if (address.length <= 16) return address
    return `${address.slice(0, 9)}...${address.slice(-9)}`
  }

  if (loading) return <Loader2 className="animate-spin" />

  return (
    <div className="w-full max-w-2xl">
      {(walletState?.adaHandle?.handle || walletState?.walletAddress) &&
        walletState.network === 1 && (
          <>
            <h2 className="mb-4 text-2xl font-bold">Global Leaderboard</h2>

            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Username
                    </th>
                    <th className="text-leloading...ft px-6 py-3 text-xs font-medium uppercase tracking-wider">
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
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-muted-foreground">
                        {formatStakeAddress(entry.username)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {entry.score}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
    </div>
  )
}

export default Leaderboard
