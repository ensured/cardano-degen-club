'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	Menu,
	Globe,
	Link as LinkIcon,
	LineChart,
	Smartphone,
	Monitor,
	UtensilsCrossed,
	Network,
	Loader2,
	ShoppingCart,
} from 'lucide-react'
import { useCommits } from './CommitContext'
import { timeAgo } from '@/utils/timeAgo'
import { Skeleton } from './ui/skeleton'
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from './ui/dialog'
import { useEffect } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useWindowWidth } from '@wojtekmaj/react-hooks'

import { SheetContent } from './SheetContent'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet'
import { timeAgoCompact } from '../lib/helper'
import { Separator } from './ui/separator'

export function HeaderNavSheet() {
	const { folderCommits, latestRepoCommit, loading, error } = useCommits()

	const [isSheetOpen, setIsSheetOpen] = useState(false)

	const handleOpenChange = () => {
		setIsSheetOpen(!isSheetOpen)
	}

	const width = useWindowWidth()
	// New state to hold the current time
	const [currentTime, setCurrentTime] = useState(Date.now())

	// Effect to update current time every minute
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now())
		}, 1000) // Update client-side currentTime state every second

		return () => clearInterval(interval) // Cleanup on unmount
	}, [])

	// Function to interpolate color based on time difference
	const getColor = (date: any) => {
		const commitTime = date ? new Date(date) : new Date() // Fallback to current date if date is invalid
		const timeDiff = (currentTime - commitTime.getTime()) / 1000 // Use currentTime for difference

		// Define the maximum time for color mapping (1 year in seconds)
		const maxTime = 365 * 24 * 60 * 60 // 1 year in seconds

		// Normalize timeDiff to a value between 0 and 1
		const normalized = Math.min(timeDiff / maxTime, 1)

		// Interpolate between green (0) and red (1)
		const r = Math.floor(255 * normalized) // Red increases with time
		const g = Math.floor(255 * (1 - normalized)) // Green decreases with time
		const b = 0 // Keep blue constant

		return `rgb(${r}, ${g}, ${b})` // Return the RGB color
	}

	const latestCommit = () => {
		return loading ? (
			<Skeleton className="flex items-center justify-center" />
		) : (
			<span className="text-sm text-muted-foreground">
				{latestRepoCommit[0]?.date ? (
					<Dialog>
						<DialogTrigger>
							<div className="flex w-full items-center gap-x-1 rounded-md px-2 hover:bg-secondary">
								<div
									className="size-3.5 shrink-0 rounded-full opacity-60 dark:opacity-[69%]"
									style={{
										backgroundColor: getColor(latestRepoCommit[0]?.date),
									}}
								/>
								<div className="text-xs tracking-tighter">({timeAgo(latestRepoCommit[0]?.date)})</div>
								<div className="flex cursor-pointer items-center gap-x-2 overflow-x-auto rounded-md bg-transparent p-1.5 px-0.5 font-mono">
									<div className="line-clamp-1 max-w-[200px] text-left text-xs tracking-tighter md:max-w-[269px]">
										{latestRepoCommit[0]?.message}
									</div>
								</div>
							</div>
						</DialogTrigger>
						<DialogContent>
							<DialogDescription>
								<VisuallyHidden>yeet</VisuallyHidden>
							</DialogDescription>
							<DialogTitle>
								<VisuallyHidden>yeet</VisuallyHidden>
							</DialogTitle>

							<Card className="mx-5 flex flex-col rounded-lg border-none bg-background shadow-lg transition-shadow duration-200 hover:shadow-xl">
								<div className="m-1 flex w-full flex-row items-center gap-1 break-all">
									<CardTitle className="rounded-lg bg-secondary/20 p-4 font-mono text-xl font-semibold tracking-tight text-muted-foreground">
										{latestRepoCommit[0]?.message || 'No commit message available.'}
									</CardTitle>
								</div>
								<CardContent className="flex flex-col gap-1 p-1">
									<div className="flex flex-row gap-1">
										<div className="flex flex-row gap-2">
											<Button variant={'outline'} className="text-xs sm:text-sm" size={'sm'}>
												<Link
													href={`https://github.com/ensured/${latestRepoCommit[0]?.repo}/commit/${latestRepoCommit[0]?.hash}`}
													target="_blank"
												>
													View Commit
												</Link>
											</Button>
											<Button variant={'outline'} className="text-xs sm:text-sm" size={'sm'}>
												<Link href={`https://github.com/ensured/${latestRepoCommit[0]?.repo}`} target="_blank">
													Visit Repository
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
							<CardDescription className="flex justify-end">
								{timeAgo(latestRepoCommit[0]?.date) + ' ago' || 'No date available.'}
							</CardDescription>
							{/* <DialogFooter className="relative px-7">
                <DialogClose
                  asChild
                  className="mx-auto flex w-full justify-center"
                >
                  <Button variant="ghost" className="border border-border/40">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter> */}
						</DialogContent>
					</Dialog>
				) : (
					''
				)}
			</span>
		)
	}

	return (
		<Sheet key={'left'} open={isSheetOpen} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<div className="flex items-center">
					<Button variant="outline" size="icon" className="flex items-center transition duration-200">
						<Menu className="text-lg" />
					</Button>
				</div>
			</SheetTrigger>
			<SheetContent className="p-3">
				<div className="flex w-full flex-row">
					<ThemeToggle />
					<div className="flex w-4/5 flex-col items-center justify-center">
						{error && (
							<span className="text-sm text-gray-500">
								<span className="text-red-500">{error}</span>
							</span>
						)}
						{loading && <Loader2 className="animate-spin" />}
						{latestCommit()}
						{error && <div className="text-xs text-red-500">{error}</div>}
					</div>
				</div>

				<VisuallyHidden>
					<SheetTitle className="flex w-full justify-center text-xl font-bold">null</SheetTitle>
				</VisuallyHidden>

				<div className="relative flex h-full flex-col gap-1 overflow-auto pb-4">
					<Separator className="my-1" />
					<div className="text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">Crypto</div>

					<CustomLink href="/punycode" onClick={handleOpenChange}>
						<Globe className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Punycode Converter</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'punycode') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'punycode')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>
					<CustomLink href="/cardano-links" onClick={handleOpenChange}>
						<LinkIcon className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Cardano Links</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'cardano-links') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'cardano-links')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>
					<CustomLink href="/crypto-tracker" onClick={handleOpenChange}>
						<LineChart className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Crypto Tracker</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'crypto-tracker') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'crypto-tracker')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>

					<CustomLink href={'/adahandle'} onClick={handleOpenChange} target={false}>
						<div className="flex">
							<h1 className="flex items-center text-lg no-underline">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="22" viewBox="0 0 22 32">
									{/* min-x min-y width height */}
									<path
										id="logo_S"
										data-name="logo S"
										d="M6.847,2.28q0-.819,1.269-1.531A6.543,6.543,0,0,1,11.458,0q1.6,0,2.071.713a1.691,1.691,0,0,1,.333.926V2.707a11.626,11.626,0,0,1,5.245,1.5c.4.284.6.558.6.818a10.97,10.97,0,0,1-.835,3.988q-.8,2.137-1.568,2.138a4.05,4.05,0,0,1-.869-.321A9.124,9.124,0,0,0,12.76,9.793a4.669,4.669,0,0,0-1.97.284.954.954,0,0,0-.5.891c0,.38.246.678.735.891a10.607,10.607,0,0,0,1.8.569,12.063,12.063,0,0,1,2.372.749,13.116,13.116,0,0,1,2.4,1.281A5.632,5.632,0,0,1,19.442,16.7a6.6,6.6,0,0,1,.735,2.991,10.022,10.022,0,0,1-.268,2.528,7.742,7.742,0,0,1-.936,2.065A5.961,5.961,0,0,1,17,26.206a9.615,9.615,0,0,1-3.141,1.212v.569q0,.819-1.269,1.531a6.531,6.531,0,0,1-3.34.747q-1.6,0-2.071-.711a1.7,1.7,0,0,1-.335-.926V27.56a21.3,21.3,0,0,1-3.775-.676Q0,25.995,0,24.961a16.977,16.977,0,0,1,.534-4.13q.535-2.172,1.269-2.173.133,0,2.772.962a12.92,12.92,0,0,0,3.976.962,3.425,3.425,0,0,0,1.736-.284,1.077,1.077,0,0,0,.4-.891c0-.38-.246-.7-.735-.962a6.491,6.491,0,0,0-1.838-.676A15.515,15.515,0,0,1,3.34,15.74a5.472,5.472,0,0,1-1.836-2.1A6.823,6.823,0,0,1,.768,10.4q0-6.553,6.079-7.655Z"
										fill="#0cd15b"
									></path>
								</svg>
							</h1>
						</div>

						<CustomLinkText>Handle Checker</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'adahandle') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'adahandle')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>

					<div className="flex items-center gap-1.5 py-2 text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">
						Scripts/Apps
					</div>

					<CustomLink
						href={'https://github.com/ensured/phone-backup-app-android'}
						onClick={handleOpenChange}
						target={true}
					>
						<Smartphone className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Android Fren</CustomLinkText>
						{latestRepoCommit[1] && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(latestRepoCommit[1].date)})
							</span>
						)}
					</CustomLink>
					<CustomLink href="/tradingview-script" onClick={handleOpenChange}>
						<Monitor className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>TradingView Adblocker</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'tradingview-script') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'tradingview-script')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>

					<div className="py-2 text-xl font-semibold text-[hsl(275,70%,60%)] dark:text-[hsl(276,70%,60%)]">Misc</div>
					<CustomLink href="/recipe-fren" onClick={handleOpenChange}>
						<UtensilsCrossed className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Recipe Fren</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'recipe-fren') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'recipe-fren')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>

					<CustomLink href="/shopping-list" onClick={handleOpenChange}>
						<ShoppingCart className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Shopping List</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'shopping-list') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'shopping-list')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>

					<CustomLink href="/port-checker" onClick={handleOpenChange}>
						<Network className="size-5 min-h-[24px] min-w-[24px]" />
						<CustomLinkText>Port Checker</CustomLinkText>
						{folderCommits.find((c) => c.folder === 'port-checker') && (
							<span className="ml-auto text-xs text-gray-500 sm:text-sm">
								({timeAgoCompact(folderCommits.find((c) => c.folder === 'port-checker')?.lastCommitDate)})
							</span>
						)}
					</CustomLink>
				</div>

				<VisuallyHidden>
					<SheetDescription>Description</SheetDescription>
				</VisuallyHidden>
			</SheetContent>
		</Sheet>
	)
}

function CustomLink({
	children,
	href,
	onClick,
	target = false,
}: {
	children: React.ReactNode
	href: string
	onClick: () => void
	target?: boolean
}) {
	return (
		<Link
			className="flex items-center gap-2 rounded-md border border-secondary/50 bg-secondary/20 p-2"
			href={href}
			onClick={(e) => {
				if (target) {
					e.preventDefault()
					window.open(href, '_blank')
					return
				}
				onClick()
			}}
			target={target ? '_blank' : undefined}
		>
			{children}
		</Link>
	)
}

function CustomLinkText({ children, className }: { children: React.ReactNode; className?: string }) {
	return <span className={`text-sm sm:text-base md:text-lg ${className}`}>{children}</span>
}
