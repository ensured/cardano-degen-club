'use client'
import Animation from '@/components/Animation'
import GoogleOneTapLogin from '@/components/GoogleOneTap'
import TradingViewChart from '@/components/TradingViewChart'
import UserLoginButtons from '@/components/UserLoginButtons'
import { useWallet } from '@/contexts/WalletContext'
import { useUser } from '@clerk/nextjs'

// export const metadata = {
// 	title: 'Crypto Price Tracker | Real-time ADA & BTC Conversion',
// 	description:
// 		'Track cryptocurrency prices and convert between ADA, BTC, and USD in real-time. Live price charts and market data.',
// 	keywords: 'crypto tracker, Cardano, ADA price, Bitcoin, BTC price, cryptocurrency converter, real-time prices',
// 	openGraph: {
// 		title: 'Crypto Price Tracker | Real-time ADA & BTC Conversion',
// 		description: 'Track cryptocurrency prices and convert between ADA, BTC, and USD in real-time.',
// 		type: 'website',
// 	},
// }

const CryptoTrackerPage = () => {
	const { user } = useUser()
	const { walletState } = useWallet()
	const userEmail = user?.emailAddresses[0]?.emailAddress

	if (!userEmail && !walletState.stakeAddress) {
		return (
			<Animation>
				<div className="flex w-full justify-center pt-6 text-center">
					<div className="flex flex-col items-center justify-center gap-2 p-2 text-xl sm:text-2xl">
						👋 Welcome to Crypto Tracker!
						<div className="max-w-[22rem] p-4 text-sm dark:text-gray-400/60 md:max-w-[26rem]">
							Sign in to get access to the Crypto Tracker
						</div>
						<div className="rounded-lg border border-border">
							<UserLoginButtons extraText="Sign in" />
						</div>
					</div>
				</div>
			</Animation>
		)
	}

	return (
		<Animation>
			<main className="mx-auto flex w-full max-w-full flex-col gap-6 p-4 sm:max-w-[800px]">
				<TradingViewChart className="h-[600px] sm:max-w-[600px]" />
			</main>
		</Animation>
	)
}

export default CryptoTrackerPage
