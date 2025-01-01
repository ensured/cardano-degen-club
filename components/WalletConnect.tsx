'use client'
import { useState } from 'react'
import { BaseAddress, Address } from '@emurgo/cardano-serialization-lib-asmjs'
import { decode as cborDecode } from 'cbor-js'
import { Button } from './ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'
import Image from 'next/image'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Globe, UserIcon, XIcon } from 'lucide-react'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Blockfrost, Lucid } from 'lucid-cardano'
import { cn } from '@/lib/utils'

interface Cardano {
	[key: string]:
		| {
				apiVersion: string
				enable: () => Promise<any>
				name: string
				icon: string
				getBalance?: () => Promise<number>
				getUsedAddresses?: () => Promise<string[]>
		  }
		| undefined
}

declare global {
	interface Window {
		cardano?: Cardano
	}
}

declare global {
	interface Window {
		lucid?: Lucid
	}
}

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

const WalletConnect = ({
	walletState,
	setWalletState,
	handleDisconnect,
	className,
}: {
	walletState: any
	setWalletState: any
	handleDisconnect: () => void
	className: string
}) => {
	const [isSheetOpen, setIsSheetOpen] = useState(false)

	const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (window.cardano) {
			const walletNames = Object.keys(window.cardano).filter(
				(key) => (window.cardano as Cardano)[key]?.apiVersion !== undefined,
			)

			setWalletState((prev: any) => ({
				...prev,
				supportedWallets: walletNames,
			}))
			setIsSheetOpen(true)
		} else {
			console.error('No Cardano object found')
			setWalletState((prev: any) => ({
				...prev,
				supportedWallets: [],
			}))
		}
	}

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
						walletImages: walletIcon ? [...walletState.walletImages, walletIcon] : walletState.walletImages,
					}

					setWalletState(newWalletState)
					setIsSheetOpen(false)
				} catch (error) {
					console.error('Error decoding balance:', error)
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Unknown error')
			}
		}
	}

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-md">
			{walletState?.walletName ? (
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-row items-center gap-2 rounded-lg bg-secondary/50 p-2">
						{walletState?.walletIcon && (
							<Image
								src={walletState?.walletIcon}
								alt="wallet icon"
								width={40}
								height={40}
								className="size-10 rounded-full"
							/>
						)}

						<span className="line-clamp-1 text-sm text-muted-foreground">
							{walletState.walletAddress?.slice(0, 12)}...{walletState.walletAddress?.slice(-4)}
						</span>
					</div>

					<Button variant="destructive" onClick={handleDisconnect} size="sm" className="w-full">
						Disconnect
					</Button>
				</div>
			) : (
				<Button
					variant="outline"
					onClick={handleConnect}
					className={cn(
						'flex w-full flex-row items-center justify-between gap-3 rounded-lg bg-secondary/50 p-2 text-left transition-colors hover:bg-secondary',
						className,
					)}
				>
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-full bg-transparent" />
						<span className="text-sm text-muted-foreground">Connect Wallet</span>
					</div>
				</Button>
			)}

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetTrigger />
				<SheetContent>
					<VisuallyHidden>
						<SheetTitle></SheetTitle>
						<SheetDescription></SheetDescription>
					</VisuallyHidden>
					<div className="flex w-full flex-col pt-1.5 font-mono tracking-[.05em] shadow-lg">
						<div className="flex flex-col items-center justify-center rounded-t-md border-b-0 border-l border-r border-t border-border p-4 px-6 text-lg outline-none md:text-xl">
							<div className="flex flex-col items-center justify-center">
								<div className="flex-1">Select a Wallet</div>
								<div className="text-xs text-muted-foreground">This doesn&apos;t actually do anything currently</div>
							</div>
						</div>

						<div className="flex flex-col border-none">
							{Array.from(
								new Set((walletState?.supportedWallets || []).map((wallet: string) => window.cardano?.[wallet]?.icon)),
							)
								.filter((icon) => icon !== undefined)
								.map((icon, index) => {
									const wallet = Object.keys(window.cardano || {}).find((key) => {
										const cardanoWallet = window.cardano?.[key]
										return cardanoWallet?.icon === icon
									})
									const walletName = wallet ? wallet.charAt(0).toUpperCase() + wallet.slice(1).toLowerCase() : ''

									return (
										<div
											key={wallet}
											onClick={() => wallet && handleWalletConnect(wallet)}
											className={`flex w-full cursor-pointer flex-row items-center justify-between gap-2 border-x border-b border-border p-4 px-6 text-lg md:text-xl ${index === 0 ? 'border-t' : ''} ${index === walletState?.supportedWallets.length - 1 - 1 ? 'rounded-b-md' : ''}`}
										>
											<div className="flex flex-row items-center gap-2">
												{typeof icon === 'string' && (
													<Image
														src={icon}
														alt={`${walletName} icon`}
														width={30}
														height={30}
														className="size-7 md:size-8"
													/>
												)}

												<span>{walletName}</span>
											</div>
											<div>
												{walletState?.walletName &&
													walletState?.walletName.toLowerCase().replace(/ /g, '').replace('wallet', '') ===
														walletName.toLowerCase().replace(/ /g, '').replace('wallet', '') && (
														<div className="flex items-center justify-center rounded-full bg-green-500 p-1">
															<CheckIcon className="size-4" />
														</div>
													)}
											</div>
										</div>
									)
								})}
						</div>
					</div>
				</SheetContent>
			</Sheet>
			{walletState.walletIcon !== null && (
				<span className="mt-2 text-sm text-muted-foreground">{walletState.balance} ₳</span>
			)}
		</div>
	)
}

export default WalletConnect
