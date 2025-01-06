'use client'
import { Button } from './ui/button'
import { SignInButton } from '@clerk/nextjs'
import { Globe } from 'lucide-react'
import Button3D from './3dButton'

const Web2LoginButton = ({ currentPath }: { currentPath: string }) => {
	return (
		<SignInButton mode="modal" forceRedirectUrl={currentPath}>
			<Button3D>Sign in</Button3D>
		</SignInButton>
	)
}

export default Web2LoginButton
