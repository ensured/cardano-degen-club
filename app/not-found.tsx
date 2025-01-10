import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inter = Inter({
	subsets: ['latin'],
	// Optional: you can add variable font settings
	variable: '--font-inter',
})

export const metadata = {
	title: '404 - Page Not Found',
	description: "The page you are looking for doesn't exist or has been moved.",
	robots: 'noindex, follow',
}

export default function NotFound() {
	return (
		<main className="flex flex-1 items-start justify-center pt-24 sm:pt-32">
			<div className="w-full max-w-md">
				<Card className="border-2 shadow-lg">
					<CardHeader className="space-y-1">
						<CardTitle className="text-center">
							<span className="duration-5000 animate-pulse bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-8xl font-bold text-transparent">
								404
							</span>
						</CardTitle>
						<CardDescription className="mt-4 text-center text-xl">Houston, we have a problem! 🚀</CardDescription>
					</CardHeader>
					<CardContent className="text-center text-muted-foreground">
						This page has pulled a disappearing act worthy of Houdini! 🎩✨
					</CardContent>
					<CardFooter className="flex justify-center">
						<Link href="/">
							<Button className="gap-2 transition-transform hover:scale-105">
								<HomeIcon size={16} />
								Beam me up, Scotty!
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		</main>
	)
}
