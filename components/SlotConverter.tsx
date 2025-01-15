'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { getEpochData } from '@/app/actions'

interface SlotConverterProps {
	network: string
	defaultSlot: number
	selectedDateTime?: string | null
}

export default function SlotConverter({ network, defaultSlot, selectedDateTime }: SlotConverterProps) {
	// Initialize slot state with defaultSlot
	const [slot, setSlot] = useState<string>(defaultSlot?.toString() || '')
	const [currentEpochData, setCurrentEpochData] = useState<any>(null)

	// Constants for Cardano Preview Testnet
	const SLOTS_PER_EPOCH = 432000 // 5 days worth of slots
	const SLOT_LENGTH = 1 // seconds

	// Update slot when defaultSlot changes
	useEffect(() => {
		if (defaultSlot) {
			setSlot(defaultSlot.toString())
		}
	}, [defaultSlot])

	useEffect(() => {
		const fetchEpochData = async () => {
			const data = await getEpochData(network)
			setCurrentEpochData(data)
		}
		fetchEpochData()
	}, [network])

	// Add effect to update slot when selectedDateTime changes
	useEffect(() => {
		if (selectedDateTime && currentEpochData) {
			const timestamp = new Date(selectedDateTime).getTime() / 1000 // to seconds
			const slotNumber = Math.floor(timestamp - currentEpochData.start_time + currentEpochData.epoch * SLOTS_PER_EPOCH)
			setSlot(slotNumber.toString())
		}
	}, [selectedDateTime, currentEpochData])

	const calculateDate = (slotNumber: number): Date | null => {
		if (!currentEpochData) return null

		try {
			const epoch = Math.floor(slotNumber / SLOTS_PER_EPOCH)
			const slotsIntoEpoch = slotNumber % SLOTS_PER_EPOCH

			// Calculate epochs difference from current epoch
			const epochsDiff = epoch - currentEpochData.epoch

			// Calculate the timestamp using the epoch start time from Blockfrost
			const timestamp = currentEpochData.start_time + (epochsDiff * SLOTS_PER_EPOCH + slotsIntoEpoch) * SLOT_LENGTH

			return new Date(timestamp * 1000) // Convert to milliseconds
		} catch (error) {
			console.error('Error calculating date:', error)
			return null
		}
	}

	const calculateEpoch = (slotNumber: number): number => {
		return Math.floor(slotNumber / SLOTS_PER_EPOCH)
	}

	const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Only allow numbers and empty string
		const value = e.target.value
		if (value === '' || /^\d+$/.test(value)) {
			setSlot(value)
		}
	}

	// New function to convert date to slot number
	const getSlotFromDateTime = (date: Date): number | null => {
		if (!currentEpochData) return null

		const timestamp = Math.floor(date.getTime() / 1000) // Convert to seconds
		const epoch = Math.floor(timestamp / SLOTS_PER_EPOCH)
		const slotsIntoEpoch = timestamp % SLOTS_PER_EPOCH

		// Calculate the slot number
		return epoch * SLOTS_PER_EPOCH + slotsIntoEpoch
	}

	// Move the parsing here, outside of the render
	const slotNum = slot ? parseInt(slot) : null
	const date = slotNum ? calculateDate(slotNum) : null
	const epoch = slotNum ? calculateEpoch(slotNum) : null

	return (
		<div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="slot-input">Cardano Slot Number</Label>
					<Input
						id="slot-input"
						type="text"
						placeholder="Enter slot number..."
						value={slot} // This will now update when defaultSlot changes
						onChange={handleSlotChange}
					/>
				</div>

				<div className="space-y-2">
					<Label>Corresponding Date & Epoch</Label>
					<div className="rounded-md bg-secondary/20 p-3">
						{date ? (
							<div className="space-y-1">
								<p className="font-medium">{date.toLocaleString()}</p>
								<p className="text-sm text-muted-foreground">{date.toUTCString()}</p>
								{epoch !== null && <p className="text-sm text-muted-foreground">Epoch: {epoch}</p>}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								{currentEpochData ? 'Enter a valid slot number to see the date' : 'Loading epoch data...'}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
