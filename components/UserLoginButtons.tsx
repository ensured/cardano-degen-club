'use client'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { GlobeIcon, UserIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserButton as ClerkUserButton, useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Web2LoginButton from '@/components/Web2LoginButton'
import WalletConnect from '@/components/WalletConnect'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { dark } from '@clerk/themes'

export default function UserLoginButtons() {
	const [isOpen, setIsOpen] = useState(false)
	const [walletState, setWalletState] = useState({
		wallet: null,
		supportedWallets: [],
		dropdownVisible: false,
		walletIcon: null,
		walletName: null,
		walletAddress: '',
		walletAddresses: [],
		balance: null,
		walletImages: [],
	})
	const { theme } = useTheme()
	const { isSignedIn } = useUser()
	const pathname = usePathname()
	const [currentPath, setCurrentPath] = useState(pathname)
	const { openUserProfile, signOut, user } = useClerk()

	const userEmail = user?.externalAccounts[0].emailAddress

	const hiddenEmail = userEmail ? userEmail.slice(0, 3) + '...' + userEmail.slice(userEmail.indexOf('@') - 2) : ''

	useEffect(() => {
		setCurrentPath(pathname)
	}, [pathname])

	const handleDisconnect = () => {
		setWalletState({
			wallet: null,
			supportedWallets: [],
			dropdownVisible: false,
			walletIcon: null,
			walletName: null,
			walletAddress: '',
			walletAddresses: [],
			balance: null,
			walletImages: [],
		})
	}

	const handleUserButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		openUserProfile()
	}

	const handleSignOut = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsOpen(false)
		signOut()
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
			<DropdownMenuTrigger asChild>
				{walletState.walletIcon !== null ? (
					<Button variant="ghost" className="px-2" aria-label="User login options">
						{walletState.walletAddress?.slice(0, 6)}...{walletState.walletAddress?.slice(-4)}
						<Image src={walletState.walletIcon} alt="wallet icon" width={32} height={32} />
					</Button>
				) : isSignedIn ? (
					<div style={{ cursor: 'pointer' }}>
						<Image src={user?.imageUrl || ''} alt="user avatar" width={32} height={32} />
					</div>
				) : (
					<Button variant="ghost" size="icon" className="rounded-full" aria-label="User login options">
						<UserIcon className="size-6" />
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-80" align="end">
				<div className="flex flex-col gap-6 rounded-lg p-6 shadow-md">
					<div className="flex flex-col items-center gap-4 border-b border-border/30 pb-6">
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
										<span className="text-sm text-muted-foreground">{hiddenEmail}</span>
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

					<div className="flex flex-col items-center gap-4">
						<h3 className="flex items-center text-lg font-semibold text-foreground/90">
							<div className="flex items-center gap-2">
								<GlobeIcon className="size-5" />
								Web3 Login
							</div>
						</h3>
						<WalletConnect
							walletState={walletState}
							setWalletState={setWalletState}
							handleDisconnect={handleDisconnect}
							className="w-full rounded-md bg-secondary/50 p-4 transition-colors hover:bg-secondary"
							aria-label="Web3 Login Button"
						/>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
