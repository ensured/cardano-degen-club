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
import StorageIndicator from "./StorageIndicator"
const revalidate = 30000

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
                className="animate-gradient relative flex flex-wrap items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#a3e5ff] to-[#a371ff] bg-[length:400%_400%] p-2.5 text-2xl transition-all ease-in-out
              
              dark:from-[#3d91c9] dark:to-[#583aa8] md:p-4 md:text-3xl"
              >
                <div className=" flex flex-row items-center justify-center gap-2 ">
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
                  <StorageIndicator />
                </Badge>
                
              </div>
            </SheetTitle>
            <div className="flex items-center justify-between">
              <SheetDescription></SheetDescription>
            </div>
          </SheetHeader>
          {children}
         
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default FavoritesSheet
