/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { MAX_FAVORITES } from "@/utils/consts"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "react-hot-toast"

import { getFavoritesFirebase } from "./actions"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
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
        const res = await getFavoritesFirebase(userEmail)

        if (!res) {
          toast.error("No favorites found")
          return
        }

        const newFavorites = {}

        // Flag to check if any invalid favorites exist
        let hasInvalidFavorites = false

        res.forEach((favorite) => {
          if (!favorite || !favorite.name || !favorite.url || !favorite.link) {
            hasInvalidFavorites = true // Set the flag to true
            return // Skip to the next iteration
          }

          newFavorites[favorite.link] = {
            name: favorite.name,
            url: favorite.url,
            link: favorite.link,
          }
        })

        // Notify user if there are invalid favorites
        if (hasInvalidFavorites) {
          toast.error("Some favorites are invalid and were not loaded.")
        }

        setFavorites(newFavorites)
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast.error("Failed to load favorites.")
      } finally {
        setIsFavoritesLoading(false) // Ensure loading state is updated
      }
    }

    if (isOpen) {
      getFavs()
    }

    // Cleanup function to prevent state updates on unmounted components
    return () => {
      setIsFavoritesLoading(false) // Clean up loading state if the component unmounts
    }
  }, [isOpen]) // Added userEmail as a dependency

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
            <SheetTitle>
              <div className=" mb-1 flex  select-none items-center justify-center gap-2 rounded-lg border border-purple-950 bg-background p-2 text-2xl shadow-md md:text-3xl">
                <StarIcon
                  size={size?.width < 768 ? 28 : 32}
                  color="#FFD700" // Use gold color for the star icon
                  cla
                />
                Favorites
              </div>
            </SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default FavoritesSheet
