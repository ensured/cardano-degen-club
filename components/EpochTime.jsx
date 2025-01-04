/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { Progress } from './ui/progress'
import { Skeleton } from './ui/skeleton'

export function EpochTime({ epochData }) {
	const [timeLeftDisplay, setTimeLeftDisplay] = useState('')
	const [percentageLeft, setPercentageLeft] = useState(0)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const updateTime = () => {
			const currentTime = Math.floor(Date.now() / 1000)
			let timeLeftUntilEnd = epochData.end_time - currentTime
			let currentEpochNumber = epochData.epoch

			// If current epoch has ended, simulate next epoch
			if (timeLeftUntilEnd < 0) {
				const epochDuration = epochData.end_time - epochData.start_time
				// Calculate how many epochs have passed since the original end time
				const epochsPassed = Math.floor(Math.abs(timeLeftUntilEnd) / epochDuration) + 1
				currentEpochNumber += epochsPassed
				// Adjust the time calculation for the current running epoch
				timeLeftUntilEnd = epochDuration - (Math.abs(timeLeftUntilEnd) % epochDuration)
			}

			// Format the time left dynamically
			let timeDisplay = []
			const days = Math.floor(timeLeftUntilEnd / 86400)
			const hours = Math.floor((timeLeftUntilEnd % 86400) / 3600)
			const minutes = Math.floor((timeLeftUntilEnd % 3600) / 60)
			const seconds = timeLeftUntilEnd % 60

			if (days > 0) timeDisplay.push(`${days}d`)
			if (hours > 0) timeDisplay.push(`${hours}h`)
			if (minutes > 0) timeDisplay.push(`${minutes}m`)
			if (seconds > 0) timeDisplay.push(`${seconds}s`)

			// Join the display parts
			const display = timeDisplay.join(' ')

			setTimeLeftDisplay(display)

			// Calculate percentage
			const totalEpochDuration = epochData.end_time - epochData.start_time
			const percentage = (timeLeftUntilEnd / totalEpochDuration) * 100
			setPercentageLeft(Math.max(0, Math.min(100, percentage)))
			setLoading(false)
		}

		// Update immediately and then every second
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
						epoch{' '}
						{epochData.epoch +
							Math.floor((Date.now() / 1000 - epochData.end_time) / (epochData.end_time - epochData.start_time))}{' '}
						ends in {timeLeftDisplay}
					</span>
				)}
			</div>
			<div className="relative h-0.5 w-full rounded-full bg-purple-200">
				<Progress value={100 - percentageLeft} className="h-full rounded-full bg-green-500" />
			</div>
		</div>
	)
}
