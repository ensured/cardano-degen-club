import { useState, useEffect } from 'react'
import { decode as cborDecode } from 'cbor-js'
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-asmjs'
import { toast } from 'sonner'
// import { getAdaHandle } from '@/app/actions'
import { isNaN } from '@/utils/helper'

export interface WalletState {
  network: number | null
  wallet: any | null
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

  useEffect(() => {
    const lastWallet = localStorage.getItem('lastConnectedWallet')
    if (lastWallet) {
      connect(lastWallet)
    }
  }, [])

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

      localStorage.setItem('lastConnectedWallet', walletKey)

      const api = await walletInstance.enable()

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

      // Get stake address and handle
      const decodedStakeAddr = decodeHexAddress(stakeAddress[0])
      const handleData = await getAdaHandle(decodedStakeAddr)

      const newWalletState = {
        ...initialWalletState,
        wallet: walletInstance,
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

      // Check existing auth
      // const existingAuth = await getWalletAuth(decodedStakeAddr)
      // if (!('error' in existingAuth)) {
      // 	setWalletState(newWalletState)
      // 	return true
      // }

      // // Request new signature
      // const token = await signMessage(api, decodedAddress)
      // if (!token) {
      // 	toast.error('User declined sign data')
      // 	return false
      // }

      // await storeWalletAuth(decodedStakeAddr, Date.now())
      // const authResponse = await getWalletAuth(decodedStakeAddr)
      // if (!('error' in authResponse) && authResponse.expiresAt) {
      // 	setExpiresAt(authResponse.expiresAt)
      // }

      setWalletState((prev) => ({ ...prev, ...newWalletState }))
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    localStorage.removeItem('lastConnectedWallet')
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
