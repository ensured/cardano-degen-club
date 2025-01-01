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
					<Button variant="ghost" aria-label="User login options">
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
			<DropdownMenuContent className="w-72" align="end">
				<div className="flex flex-col gap-6 rounded-lg p-6 shadow-md">
					<div className="flex flex-col items-center gap-4 border-b pb-4">
						{isSignedIn ? (
							<>
								<h2 className="flex items-center text-lg font-bold">
									<UserIcon className="mr-2" />
									Web2 Login
								</h2>
								<div className="flex w-[60%] items-center justify-between gap-2">
									<div onClick={handleUserButtonClick} style={{ cursor: 'pointer' }}>
										<ClerkUserButton
											appearance={{
												baseTheme: theme === 'dark' ? dark : undefined,
												elements: {
													userButtonAvatarBox: {
														width: '2rem',
														height: '2rem',
														transform: 'translateY(3px)',
													},
												},
											}}
										/>
									</div>
									<Button variant="destructive" onClick={handleSignOut} size="sm">
										Logout
									</Button>
								</div>
							</>
						) : (
							<Web2LoginButton currentPath={currentPath} />
						)}
					</div>

					<div className="flex flex-col items-center gap-4">
						<h3 className="flex items-center text-lg font-bold">
							<GlobeIcon className="mr-2" />
							Web3 Login
						</h3>
						<WalletConnect
							walletState={walletState}
							setWalletState={setWalletState}
							handleDisconnect={handleDisconnect}
							className="rounded-md p-1 transition duration-200"
							aria-label="Web3 Login Button"
						/>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
