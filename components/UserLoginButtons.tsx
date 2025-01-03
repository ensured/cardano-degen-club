'use client'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, EyeOff, GlobeIcon, Loader2, UserIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserButton as ClerkUserButton, useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Web2LoginButton from '@/components/Web2LoginButton'
import WalletConnect from '@/components/WalletConnect'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { dark } from '@clerk/themes'
import { useWallet } from '@/contexts/WalletContext'

export default function UserLoginButtons({ extraText }: { extraText?: string }) {
	const [isOpen, setIsOpen] = useState(false)
	const { theme } = useTheme()
	const { isSignedIn } = useUser()
	const pathname = usePathname()
	const [currentPath, setCurrentPath] = useState(pathname)
	const { openUserProfile, signOut } = useClerk()
	const { user } = useUser()
	const { walletState, loading } = useWallet()
	const [hiddenEmail, setHiddenEmail] = useState('')
	const userEmail = user?.externalAccounts[0].emailAddress
	const [isWalletAddressVisible, setIsWalletAddressVisible] = useState(false)
	const [isAdaHandleVisible, setIsAdaHandleVisible] = useState(true)

	useEffect(() => {
		setCurrentPath(pathname)
	}, [pathname])

	useEffect(() => {
		if (userEmail) {
			setHiddenEmail(userEmail.slice(0, 3) + '...' + userEmail.slice(userEmail.indexOf('@') - 2))
		} else {
			setHiddenEmail('')
		}
	}, [userEmail])

	const handleUserButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		openUserProfile()
	}

	const handleSignOut = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsOpen(false)
		signOut()
	}

	const web2Image = user?.imageUrl

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
			<DropdownMenuTrigger asChild>
				{walletState.walletAddress && walletState.walletIcon ? (
					<Button
						variant="outline"
						className="flex items-center gap-1.5 bg-secondary/55 px-2"
						aria-label="User login options"
					>
						<span className="line-clamp-1">
							{walletState.adaHandle?.handle && !isAdaHandleVisible && (
								<span className="text-sm text-black/80 dark:text-white/70 sm:text-base">
									${walletState.adaHandle.handle.charAt(0)}
									{'*'.repeat(walletState.adaHandle.handle.length - 1)}
								</span>
							)}
							{walletState.adaHandle?.handle && isAdaHandleVisible && (
								<span className="text-sm text-black/80 dark:text-white/70 sm:text-base">
									${walletState.adaHandle.handle}
								</span>
							)}
							{(!walletState.adaHandle?.handle || !isAdaHandleVisible) && isWalletAddressVisible
								? `${walletState?.walletAddress?.slice(0, 10)}...${walletState?.walletAddress?.slice(-4)}`
								: ''}
						</span>
						<Image src={walletState.walletIcon} alt="wallet icon" width={32} height={32} />
					</Button>
				) : isSignedIn ? (
					<div style={{ cursor: 'pointer' }}>
						{loading ? (
							<Loader2 className="size-4 animate-spin" />
						) : web2Image ? (
							<Image src={web2Image} alt="user avatar" width={32} height={32} />
						) : (
							<UserIcon className="size-5 sm:size-6" />
						)}
					</div>
				) : (
					<Button variant="ghost" size={`${!extraText ? 'icon' : 'default'}`} aria-label="User login options">
						<div className="text-md flex items-center gap-2 sm:text-base">
							{loading ? (
								<Loader2 className="size-5 animate-spin sm:size-6" />
							) : (
								<UserIcon className="size-5 sm:size-6" />
							)}
							{extraText ? extraText : ''}
						</div>
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[19rem] sm:w-[19.5rem] md:w-[20rem] lg:w-[20.5rem] xl:w-[21rem]"
				align="center"
				sideOffset={4}
				alignOffset={0}
			>
				<div className="flex flex-col gap-6 rounded-lg p-6">
					{/* web3 wallet login */}
					<div className="flex flex-col items-center gap-4">
						<h3 className="flex items-center text-lg font-semibold text-foreground/90">
							<div className="flex items-center gap-2">
								<GlobeIcon className="size-5" />
								Web3 Login
							</div>
						</h3>
						<WalletConnect
							className="w-full rounded-md bg-secondary/50 p-4 transition-colors hover:bg-secondary"
							aria-label="Web3 Login Button"
							setIsAdaHandleVisible={setIsAdaHandleVisible}
							setIsWalletAddressVisible={setIsWalletAddressVisible}
							isAdaHandleVisible={isAdaHandleVisible}
							isWalletAddressVisible={isWalletAddressVisible}
						/>
					</div>
					{/* web2 wallet login*/}
					<div className="flex flex-col items-center gap-4 border-t border-border/30 pt-6">
						<h2 className="flex items-center text-lg font-semibold text-foreground/90">
							<UserIcon className="mr-2 size-5" />
							Web2 Login
						</h2>
						{isSignedIn ? (
							<div className="flex w-full flex-col items-center gap-3">
								<div
									onClick={handleUserButtonClick}
									className="w-full cursor-pointer rounded-lg bg-secondary/50 p-2 transition-colors hover:bg-secondary"
								>
									<div className="flex items-center gap-3">
										<ClerkUserButton
											appearance={{
												baseTheme: theme === 'dark' ? dark : undefined,
												elements: {
													userButtonAvatarBox: {
														width: '2.5rem',
														height: '2.5rem',
													},
													userButtonBox: {
														width: '100%',
													},
												},
											}}
										/>
										{hiddenEmail && <span className="text-sm text-muted-foreground">{hiddenEmail}</span>}
									</div>
								</div>
								<Button variant="destructive" onClick={handleSignOut} size="sm" className="w-full">
									Logout
								</Button>
							</div>
						) : (
							<Web2LoginButton currentPath={currentPath} />
						)}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
