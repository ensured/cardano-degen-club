'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'
import { storeWalletAuth, getWalletAuth, removeWalletAuth, getAdaHandle } from '@/app/actions'
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
	const [loading, setLoading] = useState(true)

	// Load from localStorage only once on mount
	useEffect(() => {
		const savedWalletState = localStorage.getItem('walletState')
		if (savedWalletState) {
			try {
				const parsed = JSON.parse(savedWalletState)
				// Validate the parsed data has required fields before setting
				if (parsed && typeof parsed === 'object') {
					setWalletState(parsed)
				}
			} catch (error) {
				console.error('Error parsing wallet state:', error)
				localStorage.removeItem('walletState') // Clean up invalid data
			}
		}
		setLoading(false) // Move this here to ensure it's set after initial load
	}, [])

	// Save to localStorage when state changes
	useEffect(() => {
		if (!loading && walletState !== defaultWalletState) {
			// Only save if there's actual wallet data
			try {
				localStorage.setItem('walletState', JSON.stringify(walletState))
			} catch (error) {
				console.error('Error saving wallet state:', error)
			}
		}
	}, [walletState, loading])

	const handleWalletConnect = async (wallet: string): Promise<boolean> => {
		if (!window.cardano) return false
		setLoading(true)
		try {
			const walletInstance = await window.cardano[wallet]?.enable()
			const walletData = window.cardano[wallet]
			const walletName = walletData?.name || null
			const walletIcon = walletData?.icon || null

			const balanceResponse = await walletInstance.getBalance()

			try {
				const balanceBytes = Buffer.from(balanceResponse, 'hex')
				const uint8Array = new Uint8Array(balanceBytes)
				const arrayBuffer = uint8Array.buffer
				const decodedBalance = Number((cborDecode(arrayBuffer)[0] / 1000000).toFixed(0))

				const walletAddresses = await walletInstance.getUsedAddresses()
				let primaryAddress

				if (walletAddresses.length === 0) {
					// If no used addresses, get the first unused address
					const unusedAddresses = await walletInstance.getUnusedAddresses()
					primaryAddress = unusedAddresses[0]
				} else {
					primaryAddress = walletAddresses[0]
				}

				const humanReadableAddresses = walletAddresses.slice(0, 136).map((address: string) => {
					return /^[0-9a-fA-F]+$/.test(address) ? decodeHexAddress(address) : address
				})

				let stakeAddress = await walletInstance.getRewardAddresses()
				stakeAddress = stakeAddress[0]
				const stakeAddressBytes = Buffer.from(stakeAddress, 'hex')
				const stakeAddressAddress = Address.from_bytes(stakeAddressBytes)
				const stakeAddressBaseAddress = BaseAddress.from_address(stakeAddressAddress)
				const stakeAddressBech32 = stakeAddressBaseAddress
					? stakeAddressBaseAddress.to_address().to_bech32()
					: stakeAddressAddress.to_bech32()

				const adaHandle = await getAdaHandle(stakeAddressBech32)

				const newWalletState: WalletState = {
					wallet: walletInstance,
					walletIcon,
					walletName,
					walletAddress: /^[0-9a-fA-F]+$/.test(primaryAddress) ? decodeHexAddress(primaryAddress) : primaryAddress,
					walletAddresses: humanReadableAddresses,
					dropdownVisible: false,
					balance: isNaN(decodedBalance) ? 0 : decodedBalance,
					supportedWallets: [],
					walletImages: [],
					adaHandle: {
						handle: adaHandle.default_handle ? adaHandle.default_handle : false,
						total_handles: adaHandle.total_handles ? adaHandle.total_handles : false,
					},
					stakeAddress: stakeAddressBech32,
				}

				const walletAuth = newWalletState.walletAddress ? await getWalletAuth(newWalletState.walletAddress) : null
				if (walletAuth) {
					setWalletState(newWalletState)
					return true
				}
				const message = `Login to cardanodegen.shop`
				const messageHex = Buffer.from(message).toString('hex')
				const signedMessage = await walletInstance.signData(primaryAddress, messageHex)

				const token = {
					body: message,
					signature: signedMessage,
					key: primaryAddress,
				}

				const encodedToken = Buffer.from(JSON.stringify(token)).toString('base64')
				const decodedToken = JSON.parse(Buffer.from(encodedToken, 'base64').toString())

				if (decodedToken.key) {
					// Store auth in Vercel KV
					await storeWalletAuth(primaryAddress, decodedToken.signature)

					localStorage.setItem('walletState', JSON.stringify(newWalletState))
					setWalletState(newWalletState)
					return true
				}
				return false
			} catch (error: any) {
				setLoading(false)
				throw error
			}
		} catch (error) {
			console.error('Wallet connection error:', error)
			setLoading(false)
			return false
		} finally {
			setLoading(false)
		}
	}

	const detectCurrentWallet = async () => {
		if (!window.cardano) return null

		for (const walletKey of Object.keys(window.cardano)) {
			const wallet = window.cardano[walletKey]
			if (!wallet?.apiVersion) continue

			try {
				const api = await wallet.enable()
				if (api) {
					return walletKey
				}
			} catch (error) {
				console.error(`Error checking ${walletKey}:`, error)
			}
		}
		return null
	}

	// Load saved wallet state on mount
	useEffect(() => {
		const checkStoredWallet = async () => {
			setLoading(true)

			// Check for currently connected wallet
			const currentWallet = await detectCurrentWallet()

			if (currentWallet) {
				// If a wallet is connected, connect to it
				await handleWalletConnect(currentWallet)
			} else {
				// Check saved wallet as fallback
				const savedWallet = localStorage.getItem('walletState')
				if (savedWallet) {
					const parsed = JSON.parse(savedWallet) as Partial<WalletState>
					if (parsed?.walletAddress) {
						const walletAuth = await getWalletAuth(parsed.walletAddress)
						if (!walletAuth) {
							toast.error('Wallet session expired. Please connect again.')
							handleDisconnect()
						} else {
							setWalletState(parsed as WalletState)
						}
					}
				}
			}
			setLoading(false)
		}

		checkStoredWallet()
	}, [])

	const handleDisconnect = async () => {
		localStorage.removeItem('walletState')
		setWalletState(defaultWalletState)
		setLoading(false)
	}

	const handleUnlink = async () => {
		setLoading(true)
		if (walletState.walletAddress) {
			await removeWalletAuth(walletState.walletAddress)
			handleDisconnect()
		}
		setLoading(false)
		toast.success('Wallet unlinked')
	}

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
