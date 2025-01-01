'use client'
import { Button } from './ui/button'
import { SignInButton } from '@clerk/nextjs'
import { Globe } from 'lucide-react'

const Web2LoginButton = ({ currentPath }: { currentPath: string }) => {
	return (
		<SignInButton mode="modal" forceRedirectUrl={currentPath}>
			<Button variant="outline">Login</Button>
		</SignInButton>
	)
}

export default Web2LoginButton
