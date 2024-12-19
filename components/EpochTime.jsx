"use client"

import { useEffect, useState } from "react"
import { Progress } from "./ui/progress"

export function EpochTime({ epochData }) {
  const [timeLeftDisplay, setTimeLeftDisplay] = useState("")
  const [percentageLeft, setPercentageLeft] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const currentTime = Math.floor(Date.now() / 1000)
      let timeLeftUntilEnd = epochData.end_time - currentTime

      // Format the time left dynamically
      let timeDisplay = []
      const days = Math.floor(timeLeftUntilEnd / 86400)
      const hours = Math.floor((timeLeftUntilEnd % 86400) / 3600)
      const minutes = Math.floor((timeLeftUntilEnd % 3600) / 60)

      if (days > 0) timeDisplay.push(`${days}d`)
      if (hours > 0) timeDisplay.push(`${hours}h`)
      if (minutes > 0) timeDisplay.push(`${minutes}m`)

      // If no time left, show seconds
      if (timeLeftUntilEnd < 60) {
        timeDisplay.push(`${timeLeftUntilEnd} seconds`)
      }

      // Join the display parts
      const display =
        timeDisplay.length > 0 ? timeDisplay.join(" ") : "Time is up"

      setTimeLeftDisplay(display)

      // Calculate percentage
      const totalEpochDuration = epochData.end_time - epochData.start_time
      const percentage = (timeLeftUntilEnd / totalEpochDuration) * 100
      setPercentageLeft(Math.max(0, Math.min(100, percentage))) // Ensure between 0 and 100
    }

    // Update immediately and then every second
    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [epochData])

  return (
    <div
      id="epoch-time-cardano"
      className="flex w-full flex-col items-center overflow-hidden font-mono text-xs"
    >
      <div className="text-center text-muted-foreground">
        epoch {epochData.epoch} ends in {timeLeftDisplay}
      </div>
      <div className="relative h-0.5 w-full rounded-full bg-purple-200">
        <Progress
          value={percentageLeft}
          className="bg-green-500 h-full rounded-full"
        />
      </div>
    </div>
  )
}