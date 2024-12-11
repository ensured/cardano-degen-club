/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { MAX_FAVORITES } from "@/utils/consts"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, Loader2, StarIcon, Database, Trash2, Settings } from "lucide-react"
import { toast } from "react-hot-toast"

import { getFavoritesFirebase, removeItemsFirebase } from "./actions"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

const revalidate = 30000


const StorageIndicator = () => {
  const [storage, setStorage] = useState({ used: 0, total: 0 })
  const [isClearing, setIsClearing] = useState(false)

  const checkStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      console.log('Storage estimate:', {
        usage: estimate.usage,
        quota: estimate.quota,
        usageDetails: estimate.usageDetails
      })
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
        caches.keys().then(keys => 
          Promise.all(keys.map(key => caches.delete(key)))
        ),
        window.indexedDB.databases?.().then(dbs => 
          dbs?.forEach(db => window.indexedDB.deleteDatabase(db.name))
        ),
        navigator.serviceWorker?.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister()
          }
        }),
        localStorage.clear(),
        sessionStorage.clear(),
        document.cookie.split(';').forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
        })
      ])

      await new Promise(resolve => setTimeout(resolve, 1000))
      await checkStorage()
      toast.success("Cache cleared successfully")
    } catch (error) {
      console.error("Error clearing cache:", error)
      toast.error("Failed to clear cache")
    } finally {
      setIsClearing(false)
    }
  }

  useEffect(() => {
    checkStorage()
    const interval = setInterval(checkStorage, 60000)
    return () => clearInterval(interval)
  }, [])

  const usedMB = (storage.used / (1024 * 1024)).toFixed(2)
  const totalMB = (storage.total / (1024 * 1024)).toFixed(2)
  const percentUsed = Math.round((storage.used / storage.total) * 100) || 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <Settings className="mr-2 size-4" />
          Settings
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
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <span>{usedMB}MB / {totalMB}MB</span>
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
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={clearAllCache}
            >
              <Trash2 className="mr-2 size-4" />
              Clear browser cache
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
  favorites,
  setFavorites,
  userEmail,
  isFavoritesLoading,
  setIsFavoritesLoading,
}) => {
  const size = useWindowSize()
  const [lastFetchTime, setLastFetchTime] = useState(0)

  useEffect(() => {
    const getFavs = async () => {
      setIsFavoritesLoading(true)

      try {
        const currentTime = Date.now()
        const timeElapsed = currentTime - lastFetchTime

        // Fetch only if revalidate seconds have passed
        if (timeElapsed >= revalidate) {
          const res = await getFavoritesFirebase(userEmail)
          if (res) {
            setFavorites(res)
            setLastFetchTime(currentTime) // Update the last fetch time
          } else {
            toast.error("No favorites found")
          }
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast.error("Failed to load favorites from server.")
      } finally {
        setIsFavoritesLoading(false)
      }
    }

    if (isOpen) {
      getFavs()
    }
  }, [isOpen])

  return (
    <div className="flex justify-center">
      <Sheet open={isOpen} onOpenChange={() => {
        setOpen(!isOpen)
      }}>
        <SheetTrigger asChild>
          <Button
            disabled={isFavoritesLoading}
            variant="outline"
            className="flex items-center justify-between gap-1.5 px-3 py-2 text-xs md:text-sm"
            size="sm"
          >
            {isFavoritesLoading ? (
              <>
                <div className="flex items-center gap-1.5">
                  <Loader2 className="size-4 animate-spin md:size-5" />
                  <span>Favorites</span>
                </div>
                <div className="flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {Object.keys(favorites).length}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <Heart
                    className="size-4 md:size-5"
                    aria-details="Heart icon"
                  />
                  <span>Favorites</span>
                </div>
                <div className="flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {Object.keys(favorites).length}
                </div>
              </>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader className="space-y-1.5">
            <SheetTitle className="select-none">
              <div
                className="animate-gradient flex flex-wrap items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#a3e5ff] to-[#a371ff] bg-[length:400%_400%] p-2.5 text-2xl transition-all ease-in-out
              
              dark:from-[#3d91c9] dark:to-[#583aa8] md:p-4 md:text-3xl"
              >
                <div className="flex flex-row items-center justify-center gap-2 ">
                  <StarIcon
                    size={size?.width < 768 ? 28 : 32}
                    color="#FFD700" // Use gold color for the star icon
                  />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 ">
                    Favorites
                  </span>
                </div>
                <Badge
                  className="mt-1 flex border border-primary text-sm md:mt-1.5"
                  variant="outline"
                >
                  {Object.keys(favorites).length}/{MAX_FAVORITES}
                </Badge>
              </div>
            </SheetTitle>
            <div className="flex items-center justify-between">
              <SheetDescription></SheetDescription>
            </div>
          </SheetHeader>
          {children}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <StorageIndicator />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default FavoritesSheet
