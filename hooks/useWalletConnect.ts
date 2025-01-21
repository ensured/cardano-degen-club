import { useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'
// import { getAdaHandle } from '@/app/actions'
import { isNaN } from '@/utils/helper'

export interface WalletState {
  network: number | null
  wallet: any | null
  api: any | null
  supportedWallets: string[]
  walletIcon: string | null
  walletName: string | null
  walletAddress: string | null
  adaHandle: {
    handle: string | null
    total_handles: number | null
  }
  stakeAddress: string | null
  balance: number | null
  paymentKeyHash: string | null
}

const initialWalletState: WalletState = {
  network: null,
  wallet: null,
  api: null,
  supportedWallets: [],
  walletIcon: null,
  walletName: null,
  walletAddress: null,
  adaHandle: {
    handle: null,
    total_handles: null,
  },
  stakeAddress: null,
  balance: null,
  paymentKeyHash: null,
}

// interface WalletConnectProps {
// 	setExpiresAt: (time: string | null) => void
// }

const getAdaHandle = async (stakeAddress: string) => {
  const res = await fetch(`https://api.handle.me/holders/${stakeAddress}`, {
    headers: {
      accept: 'application/json',
    },
  })
  const data = await res.json()
  return data
}

export function useWalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState)
  const [loading, setLoading] = useState(false)

  // Auto-connect to last used wallet on page load
  useEffect(() => {
    const lastWallet = localStorage.getItem('lastWallet')
    if (lastWallet && !walletState.api) {
      connect(lastWallet)
    }
  }, [])

  // Check for wallet account changes
  useEffect(() => {
    if (!walletState.api) return

    let isChecking = false
    const checkWalletState = async () => {
      if (isChecking) return

      try {
        isChecking = true
        const api = walletState.api

        // Get stake address first
        const stakeAddresses = await api.getRewardAddresses()
        const decodedStakeAddr = decodeHexAddress(stakeAddresses[0])

        // Only proceed if stake address has changed
        if (decodedStakeAddr !== walletState.stakeAddress) {
          // Get other wallet details
          const [walletAddresses, balanceResponse, networkId] = await Promise.all([
            api.getUsedAddresses(),
            api.getBalance(),
            api.getNetworkId(),
          ])

          const primaryAddress =
            walletAddresses.length > 0 ? walletAddresses[0] : (await api.getUnusedAddresses())[0]

          const decodedAddress = decodeHexAddress(primaryAddress)
          if (!decodedAddress) return

          // Process balance
          const balanceBytes = Buffer.from(balanceResponse, 'hex')
          const decodedBalance = Number(
            (cborDecode(new Uint8Array(balanceBytes).buffer)[0] / 1000000).toFixed(0),
          )

          // Fetch handle only when stake address changes
          const handleData = await getAdaHandle(decodedStakeAddr)

          const newWalletState = {
            ...walletState,
            walletAddress: decodedAddress,
            balance: isNaN(decodedBalance) ? 0 : decodedBalance,
            networkId,
            stakeAddress: decodedStakeAddr,
            adaHandle: {
              handle: handleData?.default_handle,
              total_handles: handleData?.total_handles,
            },
          }

          setWalletState(newWalletState)

          // Emit a custom event when wallet state changes
          window.dispatchEvent(
            new CustomEvent('walletStateChanged', {
              detail: newWalletState,
            }),
          )
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('account changed')) {
          // Attempt to reconnect with the same wallet
          const lastWallet = localStorage.getItem('lastWallet')
          if (lastWallet) {
            await connect(lastWallet)
          }
        } else {
          console.error('Error checking wallet state:', error)
        }
      } finally {
        isChecking = false
      }
    }

    const intervalId = setInterval(checkWalletState, 2000)
    return () => clearInterval(intervalId)
  }, [walletState.api, walletState.stakeAddress])

  const decodeHexAddress = (hexAddress: string): string => {
    try {
      const bytes = new Uint8Array(Buffer.from(hexAddress, 'hex'))
      const address = Address.from_bytes(bytes)
      const baseAddress = BaseAddress.from_address(address)
      return baseAddress ? baseAddress.to_address().to_bech32() : address.to_bech32()
    } catch (error) {
      console.error('Error decoding address:', error)
      return hexAddress
    }
  }

  // const signMessage = async (api: any, address: string) => {
  // 	const message = `Login to cardanodegen.shop`
  // 	const messageHex = Buffer.from(message).toString('hex')

  // 	try {
  // 		const signedMessage = await api.signData(address, messageHex)
  // 		if (Object.keys(signedMessage).length === 0) return null

  // 		return {
  // 			body: message,
  // 			signature: signedMessage,
  // 			key: address,
  // 			stakeKey: walletState.stakeAddress,
  // 		}
  // 	} catch (error) {
  // 		console.error('Failed to sign message:', error)
  // 		return null
  // 	}
  // }

  const connect = async (walletKey: string): Promise<boolean> => {
    setLoading(true)

    try {
      const walletInstance = window.cardano?.[walletKey]
      if (!walletInstance || !walletKey || !window.cardano) throw new Error('Wallet not found')

      const api = await walletInstance.enable()

      // Store wallet name for auto-connect
      localStorage.setItem('lastWallet', walletKey)

      // Get primary address
      const walletAddresses = await api.getUsedAddresses()
      const primaryAddress =
        walletAddresses.length > 0 ? walletAddresses[0] : (await api.getUnusedAddresses())[0]

      const decodedAddress = decodeHexAddress(primaryAddress)
      if (!decodedAddress) throw new Error('No address found')

      // Get wallet details
      const [balanceResponse, networkId, stakeAddress] = await Promise.all([
        api.getBalance(),
        api.getNetworkId(),
        api.getRewardAddresses(),
      ])

      // Process balance
      const balanceBytes = Buffer.from(balanceResponse, 'hex')
      const decodedBalance = Number(
        (cborDecode(new Uint8Array(balanceBytes).buffer)[0] / 1000000).toFixed(0),
      )

      // Get stake address and handle for initial connection
      const decodedStakeAddr = decodeHexAddress(stakeAddress[0])
      const handleData = await getAdaHandle(decodedStakeAddr)

      const newWalletState = {
        ...initialWalletState,
        wallet: walletInstance,
        api: api,
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

      setWalletState(newWalletState)
      window.dispatchEvent(new CustomEvent('walletStateChanged', { detail: newWalletState }))
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    localStorage.removeItem('lastWallet')
    setWalletState(initialWalletState)
    setLoading(false)
  }

  const getSupportedWallets = () => {
    if (window.cardano) {
      const walletNames = Object.keys(window.cardano).filter(
        (key) => window.cardano?.[key]?.apiVersion !== undefined,
      )
      setWalletState((prev) => ({ ...prev, supportedWallets: walletNames }))
      return walletNames
    }
    return []
  }

  return {
    walletState,
    loading,
    connect,
    disconnect,
    getSupportedWallets,
    network: walletState.network,
  }
}
