'use client'
import Animation from '@/components/Animation'
import { toast } from 'sonner'
import ResolveHandleForm from '@/components/ResolveHandleForm'
import { useState, useEffect } from 'react'
import { getAddressFromHandle } from '../actions'
import { useWallet } from '@/contexts/WalletContext'

const Page = () => {
	const [handleName, setHandleName] = useState('')
	const [walletAddress, setWalletAddress] = useState<{
		stakeAddress: string
		image: string
		address: string
	} | null>(null)
	const [loadingAdahandle, setLoadingAdahandle] = useState(false)
	const [adahandleStats, setAdahandleStats] = useState<any>(null)

	const { walletState } = useWallet()

	const handleSubmit = async () => {
		setLoadingAdahandle(true) // Set loading state to true
		try {
			const { stakeAddress, image, address, error } = await getAddressFromHandle(handleName)
			// Check for rate limit error
			if (error || !stakeAddress) {
				toast.error(error || 'No wallet address found') // Show toast notification
				return
			}

			setWalletAddress({ stakeAddress, image, address })
			const newHandleName = handleName.toLowerCase().replace('$', '')
			setHandleName(newHandleName)
		} catch (error) {
			toast.error('Something went wrong, please try again with a new handle')
		} finally {
			setLoadingAdahandle(false)
		}
	}

	const getAdahandleStats = async () => {
		const response = await fetch('https://api.handle.me/stats', {
			headers: {
				accept: 'application/json',
			},
		})
		const data = await response.json()
		return data
	}

	useEffect(() => {
		getAdahandleStats().then((data) => {
			setAdahandleStats(data)
		})
	}, [])

	return (
		<Animation>
			<div className="m-4 flex flex-col items-center justify-center gap-4 rounded-lg p-6 shadow-sm">
				<ResolveHandleForm
					handleSubmit={handleSubmit}
					walletAddress={walletAddress}
					loadingAdahandle={loadingAdahandle}
					handleName={handleName}
					setHandleName={setHandleName}
					walletState={walletState}
				/>
			</div>
			<div className="sticky bottom-0 border-t border-border py-4">
				<h3 className="py-2 text-center text-lg font-semibold">ADA Handle Statistics</h3>

				<div className="flex flex-row items-center justify-center gap-4 p-4">
					<div className="flex flex-col items-center rounded-lg border border-border p-4 shadow-sm">
						<span className="text-3xl font-bold text-primary">{adahandleStats?.total_handles?.toLocaleString()}</span>
						<span className="text-sm text-muted-foreground">Total Handles</span>
					</div>
					<div className="flex flex-col items-center rounded-lg border border-border p-4 shadow-sm">
						<span className="text-3xl font-bold text-primary">{adahandleStats?.total_holders?.toLocaleString()}</span>
						<span className="text-sm text-muted-foreground">Total Holders</span>
					</div>
				</div>
			</div>
		</Animation>
	)
}

export default Page
