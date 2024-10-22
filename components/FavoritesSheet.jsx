/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "react-hot-toast"

import { getFavoritesFirebase } from "./actions"
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
  setIsFavoritesLoading,
  hasFetched,
  setHasFetched,
}) => {
  const theme = useTheme()
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
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 text-xs md:text-base"
            size={"sm"}
          >
            <div className="flex flex-row items-center justify-center gap-1.5">
              <Heart className="size-4 md:size-5" />
              <span className="text-xs md:text-base">Favorites</span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-2 text-2xl md:text-3xl md:text-3xl ">
                <StarIcon
                  size={size?.width < 768 ? 26 : 30}
                  color={theme.theme === "light" ? "black" : "#FFD700"}
                />
                <div className="flex gap-1">
                  Favorites
                  <div className=" text-xs font-bold md:text-sm">
                    {Object.keys(favorites).length === 0
                      ? ""
                      : `(${Object.keys(favorites).length}/100)`}
                  </div>
                </div>
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
