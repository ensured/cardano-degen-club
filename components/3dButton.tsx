import React from 'react'
import { Button } from './ui/button'

const Button3D = ({
	children,
	onClick,
}: {
	children: React.ReactNode
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => {
	return (
		<Button
			variant="outline"
			className="transform border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] transition-transform duration-100 hover:bg-background/50 active:translate-y-1 active:shadow-none"
			onClick={onClick}
		>
			{children}
		</Button>
	)
}

export default Button3D
