'use client'
import { Button } from './ui/button'
import { SignInButton } from '@clerk/nextjs'
import { Globe } from 'lucide-react'

const Web2LoginButton = ({ currentPath }: { currentPath: string }) => {
	return (
		<SignInButton mode="modal" forceRedirectUrl={currentPath}>
			<Button variant="outline">
				<span>Web2 Login</span>
				<Globe className="h-5 w-5" />
			</Button>
		</SignInButton>
	)
}

export default Web2LoginButton
