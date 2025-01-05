'use client'
import { createContext, useContext } from 'react'
import { useWalletConnect } from '@/hooks/useWalletConnect'

const WalletContext = createContext<ReturnType<typeof useWalletConnect> | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const wallet = useWalletConnect()

	return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export function useWallet() {
	const context = useContext(WalletContext)
	if (context === undefined) {
		throw new Error('useWallet must be used within a WalletProvider')
	}
	return context
}
