/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { Progress } from './ui/progress'
import { Skeleton } from './ui/skeleton'

export function EpochTime({ epochData }) {
  const [timeLeftDisplay, setTimeLeftDisplay] = useState('')
  const [percentageLeft, setPercentageLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentEpochNum, setCurrentEpochNum] = useState(epochData.epoch)

  useEffect(() => {
    const updateTime = () => {
      const currentTime = Math.floor(Date.now() / 1000)
      let timeLeftUntilEnd = epochData.end_time - currentTime
      let currentEpochNumber = epochData.epoch

      // If current epoch has ended, simulate next epoch
      if (timeLeftUntilEnd < 0) {
        const epochDuration = epochData.end_time - epochData.start_time
        const epochsPassed = Math.floor(Math.abs(timeLeftUntilEnd) / epochDuration) + 1
        currentEpochNumber += epochsPassed
        timeLeftUntilEnd = epochDuration - (Math.abs(timeLeftUntilEnd) % epochDuration)
      }

      // Format the time left dynamically
      let timeDisplay = []
      const days = Math.floor(timeLeftUntilEnd / 86400)
      const hours = Math.floor((timeLeftUntilEnd % 86400) / 3600)
      const minutes = Math.floor((timeLeftUntilEnd % 3600) / 60)
      const seconds = timeLeftUntilEnd % 60

      if (days > 0) {
        timeDisplay.push(`${days}d`)
      }
      timeDisplay.push(
        `${hours.toString().padStart(1, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`,
      )

      setTimeLeftDisplay('~' + timeDisplay.join('\u{2009}'))
      setCurrentEpochNum(currentEpochNumber)

      // Calculate percentage
      const totalEpochDuration = epochData.end_time - epochData.start_time
      const percentage = (timeLeftUntilEnd / totalEpochDuration) * 100
      setPercentageLeft(Math.max(0, Math.min(100, percentage)))
      setLoading(false)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      id="epoch-time-cardano"
      className="flex w-full select-none flex-col items-center overflow-hidden font-mono text-xs"
    >
      <div className="flex h-4 items-center gap-2 text-center text-muted-foreground">
        {loading ? (
          <Skeleton className="h-3 w-[200px]" />
        ) : (
          <span className="flex items-center justify-center text-xs">
            Epoch: {currentEpochNum} ({percentageLeft.toFixed(2)}%
            <span className="pl-1.5 tracking-tighter">{timeLeftDisplay})</span>
          </span>
        )}
      </div>
      <div className="relative h-0.5 w-full rounded-full bg-purple-200">
        <Progress value={100 - percentageLeft} className="h-full rounded-full bg-green-500" />
      </div>
    </div>
  )
}
