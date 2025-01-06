'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
	const { setTheme, theme } = useTheme()

	return (
		<Button variant="ghost" size="smIcon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
			<Moon className="hidden size-5 dark:block sm:size-6" />
			<Sun className="block size-5 dark:hidden sm:size-6" />
		</Button>
	)
}
