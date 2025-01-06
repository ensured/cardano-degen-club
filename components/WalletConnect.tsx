'use client'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetDescription, SheetTitle } from './ui/sheet'
import Image from 'next/image'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { CheckIcon, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWallet } from '@/contexts/WalletContext'
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTrigger,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogFooter,
	AlertDialogCancel,
} from './ui/alert-dialog'
import { Input } from './ui/input'
import Link from 'next/link'
import { getWalletAuth } from '@/app/actions'

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

interface WalletConnectProps {
	className: string
	setIsAdaHandleVisible: (value: boolean) => void
	setIsWalletAddressVisible: (value: boolean) => void
	isAdaHandleVisible: boolean
	isWalletAddressVisible: boolean
}

const WalletConnect = ({
	className,
	setIsAdaHandleVisible,
	setIsWalletAddressVisible,
	isAdaHandleVisible,
	isWalletAddressVisible,
}: WalletConnectProps) => {
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const { walletState, loading, connect, disconnect, unlink, getSupportedWallets, setExpiresAt, timeLeft } = useWallet()

	useEffect(() => {
		const checkWalletAuth = async () => {
			if (walletState.stakeAddress) {
				const auth = await getWalletAuth(walletState.stakeAddress)
				if (!('error' in auth) && auth.expiresAt) {
					setExpiresAt(auth.expiresAt)
				}
			}
		}

		checkWalletAuth()
	}, [walletState.stakeAddress, setExpiresAt])

	const handleOpenConnectSheet = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		getSupportedWallets()
		setIsSheetOpen(true)
	}

	const handleConnect = async (wallet: string) => {
		setIsSheetOpen(false)
		await connect(wallet)
	}

	return (
		<div className="flex w-full flex-col items-center justify-center rounded-md">
			{walletState?.walletName ? (
				<div className="flex w-full flex-col gap-2">
					<div className="flex w-full flex-row items-center justify-between gap-2 rounded-lg bg-secondary/50 p-2">
						{walletState?.walletIcon && (
							<Image
								src={walletState?.walletIcon}
								alt="wallet icon"
								width={40}
								height={40}
								className="size-10 rounded-full"
							/>
						)}

						<div className="flex flex-1 items-center justify-between">
							<span className="line-clamp-1 text-sm text-muted-foreground sm:text-base">
								{walletState.adaHandle?.handle ? (
									<span>
										$
										{isAdaHandleVisible
											? walletState.adaHandle.handle
											: `${walletState.adaHandle.handle.charAt(0)}${'*'.repeat(walletState.adaHandle.handle.length - 1)}`}
									</span>
								) : (
									<span>
										{isWalletAddressVisible
											? `${walletState?.walletAddress?.slice(0, 10)}...${walletState?.walletAddress?.slice(-4)}`
											: `${walletState?.walletAddress?.slice(0, 4)}...${walletState?.walletAddress?.slice(-4)}`}
									</span>
								)}
							</span>
							<button
								onClick={() => {
									if (walletState.adaHandle?.handle) {
										setIsAdaHandleVisible(!isAdaHandleVisible)
									} else {
										setIsWalletAddressVisible(!isWalletAddressVisible)
									}
								}}
								className="group ml-2"
							>
								{(walletState.adaHandle?.handle ? isAdaHandleVisible : isWalletAddressVisible) ? (
									<>
										<div className="group-hover:hidden">
											<Eye />
										</div>
										<div className="hidden group-hover:block">
											<EyeOff />
										</div>
									</>
								) : (
									<>
										<div className="group-hover:hidden">
											<EyeOff />
										</div>
										<div className="hidden group-hover:block">
											<Eye />
										</div>
									</>
								)}
							</button>
						</div>
					</div>
					<div className="flex flex-row items-center justify-between gap-2">
						{walletState.balance !== null && (
							<span className="mt-2 text-sm text-muted-foreground">
								{isAdaHandleVisible
									? `${walletState.balance.toLocaleString()} ₳`
									: '*'.repeat(String(walletState.balance).length) + ' ₳'}
							</span>
						)}
						{!walletState.adaHandle.handle && (
							<Button
								variant="link"
								asChild
								className="mt-2 h-auto p-0 text-sm text-muted-foreground hover:text-primary"
							>
								<Link href="https://handle.me" target="_blank" rel="noopener noreferrer">
									Get $handle
								</Link>
							</Button>
						)}
					</div>
					<Button variant="destructive" onClick={async () => disconnect()} size="sm" className="w-full">
						Disconnect
					</Button>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm" className="w-full">
								Unlink
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete all wallet data. Type &quot;unlink&quot; to confirm.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<form
								onSubmit={async (e) => {
									e.preventDefault()
									const button = document.getElementById('confirmUnlink') as HTMLButtonElement
									if (!button.disabled) {
										await unlink()
									}
								}}
							>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Input
											id="unlinkConfirm"
											placeholder="Type 'unlink' to confirm"
											className="col-span-4"
											onChange={(e) => {
												const button = document.getElementById('confirmUnlink') as HTMLButtonElement
												if (button) {
													button.disabled = e.target.value !== 'unlink'
												}
											}}
										/>
									</div>
								</div>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										type="submit"
										id="confirmUnlink"
										disabled={true}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Unlink Wallet
									</AlertDialogAction>
								</AlertDialogFooter>
							</form>
						</AlertDialogContent>
					</AlertDialog>

					{walletState?.walletName && (
						<div className="mt-2 text-xs text-muted-foreground">
							{timeLeft && (
								<div className="flex items-center justify-between">
									<span>Session expires in:</span>
									<span
										className={`font-mono ${
											timeLeft === 'Expired'
												? 'text-destructive'
												: parseInt(timeLeft?.split('m')[0] || '0') < 5
													? 'text-warning'
													: 'text-success'
										}`}
									>
										{timeLeft}
									</span>
								</div>
							)}
						</div>
					)}
				</div>
			) : (
				<Button
					variant="outline"
					onClick={handleOpenConnectSheet}
					className={cn(
						'flex w-full flex-col items-center justify-center bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary',
						className,
					)}
				>
					Connect Wallet
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
								<div className="text-xs text-muted-foreground">
									You can unlink a wallet at any time by clicking the Unlink button. Deletes all associated data.
								</div>
							</div>
						</div>

						<div className="flex flex-col border-none">
							{Array.from(new Set(walletState.supportedWallets.map((wallet: string) => window.cardano?.[wallet]?.icon)))
								.filter((icon): icon is string => icon !== undefined)
								.map((icon, index) => {
									const wallet = Object.keys(window.cardano || {}).find((key) => {
										const cardanoWallet = window.cardano?.[key]
										return cardanoWallet?.icon === icon
									})
									const walletName = wallet ? wallet.charAt(0).toUpperCase() + wallet.slice(1).toLowerCase() : ''

									return (
										<div
											key={wallet}
											onClick={(e) => {
												e.preventDefault()
												wallet && handleConnect(wallet)
											}}
											className={cn(
												'flex w-full cursor-pointer flex-row items-center justify-between gap-2 border-x border-b border-border p-4 px-6 text-lg md:text-xl',
												index === 0 && 'border-t',
												index === walletState.supportedWallets.length - 1 && 'rounded-b-md',
												loading && 'cursor-wait opacity-50',
											)}
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

												<span>{loading ? <Loader2 className="animate-spin" /> : walletName}</span>
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
		</div>
	)
}

export default WalletConnect
