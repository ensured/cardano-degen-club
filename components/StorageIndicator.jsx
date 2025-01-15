'use client'
import { Database, Info, Loader2, Settings, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { toast } from 'react-hot-toast'

const StorageIndicator = () => {
	const [storage, setStorage] = useState({ used: 0, total: 0 })
	const [isClearing, setIsClearing] = useState(false)

	const checkStorage = async () => {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			const estimate = await navigator.storage.estimate()
			setStorage({
				used: estimate.usage || 0,
				total: estimate.quota || 0,
			})
		}
	}

	const clearAllCache = async () => {
		setIsClearing(true)
		try {
			await Promise.all([
				caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
				window.indexedDB.databases?.().then((dbs) => dbs?.forEach((db) => window.indexedDB.deleteDatabase(db.name))),
				navigator.serviceWorker?.getRegistrations().then((registrations) => {
					for (const registration of registrations) {
						registration.unregister()
					}
				}),
				localStorage.clear(),
				sessionStorage.clear(),
				document.cookie.split(';').forEach((cookie) => {
					document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
				}),
			])

			await new Promise((resolve) => setTimeout(resolve, 1000))
			await checkStorage()
			toast.success('Cache cleared! Refresh the page to see any changes.')
		} catch (error) {
			console.error('Error clearing cache:', error)
			toast.error('Failed to clear cache')
		} finally {
			setIsClearing(false)
		}
	}

	useEffect(() => {
		checkStorage()
		const interval = setInterval(checkStorage, 60000)
		return () => clearInterval(interval)
	}, [])

	const formatStorage = (bytes) => {
		const gb = bytes / (1024 * 1024 * 1024)
		const mb = bytes / (1024 * 1024)
		return gb >= 1 ? `${gb.toFixed(2)}GB` : `${mb.toFixed(2)}MB`
	}

	const usedStorage = formatStorage(storage.used)
	const totalStorage = formatStorage(storage.total)
	const percentUsed = Math.round((storage.used / storage.total) * 100) || 0

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="px-1">
					<Settings className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Storage Usage */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Storage Usage</label>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Database className="size-4" />
							<div className="flex items-center gap-1.5">
								<div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
									<div
										className={`h-full rounded-full bg-primary transition-all duration-500`}
										style={{ width: `${percentUsed}%` }}
									/>
								</div>
								<span>
									{usedStorage} / {totalStorage}
								</span>
							</div>
						</div>
					</div>

					{/* Clear Cache Button */}
					{isClearing ? (
						<Button variant="destructive" className="w-full" disabled>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Clearing cache...
						</Button>
					) : (
						<Button variant="destructive" className="w-full" onClick={clearAllCache}>
							<Trash2 className="mr-2 size-4" />
							Clear browser cache
						</Button>
					)}
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Info className="size-4" />
					This is useful if you need to clear up space on your device if you have saved a lot of recipes.
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default StorageIndicator
