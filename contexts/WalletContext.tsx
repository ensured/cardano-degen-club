'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useWalletConnect } from '@/hooks/useWalletConnect'
import { type WalletState } from '@/hooks/useWalletConnect'

export type WalletContextType = {
  walletState: WalletState
  loading: boolean
  connect: (walletKey: string) => Promise<boolean>
  disconnect: () => void
  getSupportedWallets: () => string[]
}

// Create context with the correct type
const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const wallet = useWalletConnect()

  useEffect(() => {
    const handleWalletStateChange = (event: CustomEvent<WalletState>) => {
      // Update the entire wallet state when changes occur
      wallet.walletState = event.detail
    }

    window.addEventListener('walletStateChanged', handleWalletStateChange as EventListener)

    return () => {
      window.removeEventListener('walletStateChanged', handleWalletStateChange as EventListener)
    }
  }, [])

  // const [timeLeft, setTimeLeft] = useState<string | null>(null)

  // useEffect(() => {
  // 	if (!expiresAt) return

  // 	const formatTimeLeft = (diff: number): string => {
  // 		if (diff <= 0) return 'Expired'

  // 		const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  // 		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  // 		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  // 		const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  // 		if (days > 30) {
  // 			const months = Math.floor(days / 30)
  // 			return `${months} month${months > 1 ? 's' : ''}`
  // 		}
  // 		if (days > 0) {
  // 			return `${days} day${days > 1 ? 's' : ''}`
  // 		}
  // 		if (hours > 0) {
  // 			return `${hours} hour${hours > 1 ? 's' : ''}`
  // 		}
  // 		if (minutes > 0) {
  // 			return `${minutes} minute${minutes > 1 ? 's' : ''}`
  // 		}
  // 		return `${seconds} second${seconds !== 1 ? 's' : ''}`
  // 	}

  // 	const updateTimeLeft = () => {
  // 		const now = new Date().getTime()
  // 		const expiration = new Date(expiresAt).getTime()
  // 		const diff = expiration - now
  // 		setTimeLeft(formatTimeLeft(diff))
  // 	}

  // 	updateTimeLeft()
  // 	// Use 1000ms interval when less than a minute remains, otherwise use 60000ms
  // 	const interval = setInterval(() => {
  // 		const now = new Date().getTime()
  // 		const expiration = new Date(expiresAt).getTime()
  // 		const diff = expiration - now

  // 		if (diff <= 60000) {
  // 			// Less than a minute
  // 			clearInterval(interval)
  // 			const secondsInterval = setInterval(updateTimeLeft, 1000)
  // 			return () => clearInterval(secondsInterval)
  // 		}
  // 		updateTimeLeft()
  // 	}, 60000)

  // 	return () => clearInterval(interval)
  // }, [expiresAt])

  const contextValue = {
    walletState: wallet.walletState,
    loading: wallet.loading,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    getSupportedWallets: wallet.getSupportedWallets,
    network: wallet.walletState.network,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
