'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'
import { storeWalletAuth, getWalletAuth, removeWalletAuth, getAdaHandle } from '@/app/actions'
import { isNaN } from '@/utils/helper'
// Function to decode hexadecimal address to Bech32

const decodeHexAddress = (hexAddress: string): string => {
	try {
		const bytes = Buffer.from(hexAddress, 'hex')
		const address = Address.from_bytes(bytes)
		const baseAddress = BaseAddress.from_address(address)
		return baseAddress ? baseAddress.to_address().to_bech32() : address.to_bech32()
	} catch (error) {
		console.error('Error decoding address:', error)
		return hexAddress
	}
}

export interface WalletState {
	wallet: any | null
	supportedWallets: string[]
	dropdownVisible: boolean
	walletIcon: string | null
	walletName: string | null
	walletAddress: string | null
	adaHandle: {
		handle: string | null
		total_handles: number | null
	}
	stakeAddress: string | null
	walletAddresses: string[]
	balance: number | null
	walletImages: string[]
	paymentKeyHash: string | null
}

const defaultWalletState: WalletState = {
	wallet: null,
	supportedWallets: [],
	dropdownVisible: false,
	walletIcon: null,
	walletName: null,
	walletAddress: null,
	adaHandle: {
		handle: null,
		total_handles: null,
	},
	stakeAddress: null,
	walletAddresses: [],
	balance: null,
	walletImages: [],
	paymentKeyHash: null,
}

interface WalletContextType {
	walletState: WalletState
	setWalletState: (state: WalletState) => void
	handleDisconnect: () => void
	handleUnlink: () => Promise<void>
	handleWalletConnect: (wallet: string) => Promise<boolean>
	adaHandle: { handle: string | null; total_handles: number | null }
	loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [walletState, setWalletState] = useState<WalletState>(defaultWalletState)
	const [loading, setLoading] = useState(false)

	const updateWalletState = async (walletInstance: any, primaryAddress: string, newWalletState: WalletState) => {
		try {
			const api = await walletInstance.enable()
			const message = `Login to cardanodegen.shop`
			const messageHex = Buffer.from(message).toString('hex')

			try {
				const signedMessage = await api.signData(primaryAddress, messageHex)

				const isEmpty = (obj: any) => Object.keys(obj).length === 0
				if (isEmpty(signedMessage)) {
					return false
				}

				const token = {
					body: message,
					signature: signedMessage,
					key: primaryAddress,
					stakeKey: newWalletState.stakeAddress,
				}

				const encodedToken = Buffer.from(JSON.stringify(token)).toString('base64')
				const decodedToken = JSON.parse(Buffer.from(encodedToken, 'base64').toString())

				if (decodedToken.key && newWalletState.stakeAddress) {
					const timestamp = Date.now()
					await storeWalletAuth(newWalletState.stakeAddress, timestamp)
					setWalletState(newWalletState)
					return true
				}
				return false
			} catch (signError) {
				console.error('Failed to sign message:', signError)
				return false
			}
		} catch (error: any) {
			console.error(error.message)
			return false
		}
	}

	const handleWalletConnect = async (walletKey: string): Promise<boolean> => {
		setLoading(true)
		try {
			const walletInstance = window.cardano?.[walletKey]

			if (!walletInstance) {
				throw new Error('Wallet not found')
			}

			const api = await walletInstance.enable()
			const walletAddresses = await api.getUsedAddresses()
			let primaryAddress

			if (walletAddresses.length === 0) {
				const unusedAddresses = await api.getUnusedAddresses()
				primaryAddress = unusedAddresses[0]
			} else {
				primaryAddress = walletAddresses[0]
			}

			const decodedAddress = decodeHexAddress(primaryAddress)
			const balanceResponse = await api.getBalance()
			const balanceBytes = Buffer.from(balanceResponse, 'hex')
			const uint8Array = new Uint8Array(balanceBytes)
			const arrayBuffer = uint8Array.buffer
			const decodedBalance = Number((cborDecode(arrayBuffer)[0] / 1000000).toFixed(0))
			const networkId = await api.getNetworkId()
			const stakeAddress = await api.getRewardAddresses()
			const decodedStakeAddr = decodeHexAddress(stakeAddress[0])
			const handleData = await getAdaHandle(decodedStakeAddr)

			if (!decodedAddress) {
				throw new Error('No address found')
			}

			const newWalletState = {
				...walletState,
				walletName: walletInstance.name,
				walletAddress: decodedAddress,
				walletIcon: walletInstance.icon,
				balance: isNaN(decodedBalance) ? 0 : decodedBalance,
				networkId,
				stakeAddress: decodedStakeAddr,
				adaHandle: {
					handle: handleData?.default_handle,
					total_handles: handleData?.total_handles,
				},
			}

			// Check for existing valid auth first
			const existingAuth = await getWalletAuth(decodedStakeAddr)
			if (!('error' in existingAuth)) {
				// If we have valid auth, just update the state
				setWalletState(newWalletState)
				return true
			}

			// Only request signature if we don't have valid auth
			const success = await updateWalletState(walletInstance, decodedAddress, newWalletState)
			if (!success) {
				toast.error('Please sign the message to connect your wallet')
				return false
			}

			return true
		} catch (error: any) {
			console.error('Error connecting wallet:', error)
			toast.error(error.message)
			return false
		} finally {
			setLoading(false)
		}
	}

	// const detectCurrentWallet = async () => {
	// 	setLoading(true)
	// 	if (!window.cardano) return null

	// 	for (const walletKey of Object.keys(window.cardano)) {
	// 		const wallet = window.cardano[walletKey]
	// 		if (!wallet?.apiVersion) continue

	// 		try {
	// 			const api = await wallet.enable()
	// 			if (api) {
	// 				setLoading(false)
	// 				return walletKey
	// 			}
	// 		} catch (error) {
	// 			console.error(`Error checking ${walletKey}:`, error)
	// 		}
	// 	}
	// 	setLoading(false)
	// 	return null
	// }

	// // Load saved wallet state on mount
	// useEffect(() => {
	// 	const checkStoredWallet = async () => {
	// 		try {
	// 			setLoading(true)
	// 			// Check for currently connected wallet
	// 			const currentWallet = await detectCurrentWallet()

	// 			if (currentWallet) {
	// 				// If a wallet is connected, connect to it
	// 				await handleWalletConnect(currentWallet)
	// 			} else {
	// 				// Check saved wallet as fallback
	// 				const savedWallet = localStorage.getItem('walletState')
	// 				if (savedWallet) {
	// 					const parsed = JSON.parse(savedWallet) as Partial<WalletState>
	// 					if (parsed?.walletAddress) {
	// 						const walletAuth = await getWalletAuth(parsed.walletAddress)
	// 						if (!walletAuth) {
	// 							toast.error('Wallet session expired. Please connect again.')
	// 							handleDisconnect()
	// 						} else {
	// 							setWalletState(parsed as WalletState)
	// 						}
	// 					}
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error('Error checking stored wallet:', error)
	// 			handleDisconnect()
	// 		} finally {
	// 			setLoading(false)
	// 		}
	// 	}

	// 	checkStoredWallet()
	// }, [])

	const handleDisconnect = async () => {
		setWalletState(defaultWalletState)
		setLoading(false)
	}

	const handleUnlink = async () => {
		setLoading(true)
		if (walletState.stakeAddress) {
			await removeWalletAuth(walletState.stakeAddress)
			handleDisconnect()
		}
		setLoading(false)
		toast.success('Wallet unlinked')
	}

	useEffect(() => {
		if (walletState?.stakeAddress) {
			const checkAuth = async () => {
				const auth = await getWalletAuth(walletState.stakeAddress!)
				if ('error' in auth) {
					if (auth.error === 'Auth expired') {
						toast.error(`Wallet session expired at ${new Date(auth.expiredAt!).toLocaleString()}`)
						handleDisconnect()
					}
				} else if (auth.expiresAt) {
					const expiresAt = new Date(auth.expiresAt)
					const timeUntilExpiry = expiresAt.getTime() - Date.now()

					// Show warning if expiring in less than 1 hour
					if (timeUntilExpiry < 3600000) {
						toast.warning(`Wallet session expires at ${expiresAt.toLocaleString()}`, { duration: 10000 })
					}
				}
			}

			// Initial check
			checkAuth()

			// Set up interval to check periodically (every 5 minutes)
			const interval = setInterval(checkAuth, 5 * 60 * 1000)

			// Cleanup interval on unmount or when stakeAddress changes
			return () => clearInterval(interval)
		}
	}, [walletState?.stakeAddress])

	return (
		<WalletContext.Provider
			value={{
				walletState,
				setWalletState,
				handleDisconnect,
				handleWalletConnect,
				handleUnlink,
				loading,
				adaHandle: walletState.adaHandle,
			}}
		>
			{children}
		</WalletContext.Provider>
	)
}

export function useWallet() {
	const context = useContext(WalletContext)
	if (context === undefined) {
		throw new Error('useWallet must be used within a WalletProvider')
	}
	return context
}
