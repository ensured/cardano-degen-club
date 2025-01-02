'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'

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

interface WalletContextType {
	walletState: any
	setWalletState: (state: any) => void
	handleDisconnect: () => void
	persistAuthToken: (key: string) => void
	removeAuthToken: () => void
	handleWalletConnect: (wallet: string) => Promise<boolean>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const [walletState, setWalletState] = useState<any>({})
	const [authToken, setAuthToken] = useState<string | null>(null)

	const handleWalletConnect = async (wallet: string) => {
		if (window.cardano) {
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

					const newWalletState = {
						wallet: walletInstance,
						walletIcon,
						walletName,
						walletAddress: humanReadableAddresses[0],
						walletAddresses: humanReadableAddresses,
						dropdownVisible: false,
						balance: decodedBalance,
					}

					const address = walletAddresses[0]
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

					if (decodedToken.key === address) {
						persistAuthToken(decodedToken.key)
						setWalletState(newWalletState)
						return true
					}
					return false
				} catch (error: any) {
					throw error
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Unknown error')
			}
		}
		return false
	}

	// Load saved wallet state on mount
	useEffect(() => {
		const savedWallet = localStorage.getItem('walletState')
		if (savedWallet) {
			const parsed = JSON.parse(savedWallet)
			// Attempt to reconnect to the wallet
			if (window.cardano && parsed.walletName) {
				window.cardano[parsed.walletName.toLowerCase()]
					?.enable()
					.then((walletInstance) => {
						setWalletState({
							...parsed,
							wallet: walletInstance,
						})
					})
					.catch(console.error)
			}
		}
	}, [])

	// Save wallet state on changes
	useEffect(() => {
		if (walletState.walletName) {
			localStorage.setItem('walletState', JSON.stringify(walletState))
		}
	}, [walletState])

	const handleDisconnect = () => {
		localStorage.removeItem('walletState')
		setWalletState({})
		setAuthToken(null)
		removeAuthToken()
	}

	const persistAuthToken = (key: string) => {
		localStorage.setItem('CardanoAuthToken', key)
	}

	const removeAuthToken = () => {
		localStorage.removeItem('CardanoAuthToken')
	}

	return (
		<WalletContext.Provider
			value={{
				walletState,
				setWalletState,
				handleDisconnect,
				persistAuthToken,
				removeAuthToken,
				handleWalletConnect,
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
