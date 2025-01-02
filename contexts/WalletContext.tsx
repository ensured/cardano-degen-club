'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'
import { storeWalletAuth, getWalletAuth, removeWalletAuth } from '@/app/actions'
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

interface WalletState {
	wallet: any | null
	supportedWallets: string[]
	dropdownVisible: boolean
	walletIcon: string | null
	walletName: string | null
	walletAddress: string | null
	walletAddresses: string[]
	balance: string | null
	walletImages: string[]
}

const defaultWalletState: WalletState = {
	wallet: null,
	supportedWallets: [],
	dropdownVisible: false,
	walletIcon: null,
	walletName: null,
	walletAddress: null,
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [walletState, setWalletState] = useState<WalletState>(defaultWalletState)
	// const [authToken, setAuthToken] = useState<string | null>(null)

	const handleWalletConnect = async (wallet: string): Promise<boolean> => {
		if (!window.cardano) return false
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
				const decodedBalance = (cborDecode(arrayBuffer)[0] / 1000000).toLocaleString()

				const walletAddresses = await walletInstance.getUsedAddresses()

				const humanReadableAddresses = walletAddresses.slice(0, 136).map((address: string) => {
					return /^[0-9a-fA-F]+$/.test(address) ? decodeHexAddress(address) : address
				})

				const newWalletState: WalletState = {
					wallet: walletInstance,
					walletIcon,
					walletName,
					walletAddress: humanReadableAddresses[0],
					walletAddresses: humanReadableAddresses,
					dropdownVisible: false,
					balance: decodedBalance,
					supportedWallets: [],
					walletImages: [],
				}

				const address = walletAddresses[0]
				const walletAuth = await getWalletAuth(humanReadableAddresses[0])
				if (walletAuth) {
					setWalletState(newWalletState)
					return true
				}
				const message = `Login to cardanodegen.shop`
				const messageHex = Buffer.from(message).toString('hex')
				const signedMessage = await walletInstance.signData(address, messageHex)

				const token = {
					body: message,
					signature: signedMessage,
					key: address,
				}

				const encodedToken = Buffer.from(JSON.stringify(token)).toString('base64')
				const decodedToken = JSON.parse(Buffer.from(encodedToken, 'base64').toString())

				if (decodedToken.key) {
					// Store auth in Vercel KV
					await storeWalletAuth(humanReadableAddresses[0], decodedToken.signature)

					localStorage.setItem('walletState', JSON.stringify(newWalletState))
					setWalletState(newWalletState)
					return true
				}
				return false
			} catch (error: any) {
				throw error
			}
		} catch (error) {
			console.error('Wallet connection error:', error)
			return false
		}
	}

	// Load saved wallet state on mount
	useEffect(() => {
		const checkStoredWallet = async () => {
			const savedWallet = localStorage.getItem('walletState')
			if (savedWallet) {
				const parsed = JSON.parse(savedWallet) as Partial<WalletState>
				if (parsed?.walletAddress) {
					// check if wallet is still valid on server
					const walletAuth = await getWalletAuth(parsed.walletAddress)
					if (!walletAuth) {
						toast.error('Wallet session expired. Please connect again.')
						handleDisconnect()
						return
					}
					setWalletState(parsed as WalletState)
				}
			}
		}

		checkStoredWallet()
	}, [])

	const handleDisconnect = async () => {
		localStorage.removeItem('walletState')
		setWalletState(defaultWalletState)
		toast.success('Wallet disconnected')
	}

	const handleUnlink = async () => {
		if (walletState.walletAddress) {
			await removeWalletAuth(walletState.walletAddress)
			handleDisconnect()
			toast.success('Wallet unlinked')
		}
	}

	return (
		<WalletContext.Provider
			value={{
				walletState,
				setWalletState,
				handleDisconnect,
				handleWalletConnect,
				handleUnlink,
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
