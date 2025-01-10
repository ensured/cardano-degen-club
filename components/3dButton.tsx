import { cn } from '@/lib/utils'
import React from 'react'
import { Button } from './ui/button'

const Button3D = ({
	children,
	onClick,
	disabled,
	className,
	variant = 'outline',
}: {
	children: React.ReactNode
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
	disabled?: boolean
	variant?: 'outline'
	className?: string
}) => {
	return (
		<Button
			variant={variant}
			className={cn(
				'border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] transition-transform duration-100 hover:bg-background/50 active:translate-y-1 active:shadow-none',
				className,
			)}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</Button>
	)
}

export default Button3D
