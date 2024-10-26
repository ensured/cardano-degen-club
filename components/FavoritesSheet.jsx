/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { MAX_FAVORITES } from "@/utils/consts"
import { extractRecipeId } from "@/utils/helper"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"
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

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
  loading,
  favorites,
  setFavorites,
  userEmail,
  isFavoritesLoading,
  setIsFavoritesLoading,
}) => {
  const size = useWindowSize()

  useEffect(() => {
    const getFavs = async () => {
      setIsFavoritesLoading(true)

      try {
        // Check if favorites are already in localStorage
        const cachedFavorites = localStorage.getItem(`favorites`)
        if (cachedFavorites) {
          return
        }

        // Otherwise, fetch from server
        const res = await getFavoritesFirebase(userEmail)
        if (res) {
          localStorage.setItem(`favorites`, JSON.stringify(res))
          setFavorites(res)
        } else {
          toast.error("No favorites found")
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast.error(
          "Failed to load favorites from localStorage. Must be empty ;)"
        )
      } finally {
        setIsFavoritesLoading(false)
      }
    }

    if (isOpen) {
      getFavs()
    }
  }, [isOpen, userEmail])

  return (
    <div className="flex justify-center">
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            disabled={isFavoritesLoading || loading}
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
          <SheetHeader>
            <SheetTitle className="select-none">
              <div className="flex items-center justify-center gap-2 rounded-sm border-b border-b-black/20 bg-background p-1.5 text-2xl shadow dark:border-b-white/10 md:text-3xl">
                <StarIcon
                  size={size?.width < 768 ? 28 : 32}
                  color="#FFD700" // Use gold color for the star icon
                />
                Favorites
              </div>
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default FavoritesSheet
