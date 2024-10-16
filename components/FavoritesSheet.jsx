/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, useEffect, useState } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "react-hot-toast"

import { getFavorites } from "./actions"
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
  hasFetched,
  setHasFetched,
}) => {
  const theme = useTheme()
  const size = useWindowSize()

  useEffect(() => {
    const getFavs = async () => {
      setIsFavoritesLoading(true)
      const res = await getFavorites(userEmail)
      if (!res) {
        setIsFavoritesLoading(false)
        return
      }

      const newFavorites = {}
      res.forEach((favorite) => {
        if (!favorite || !favorite.name || !favorite.url || !favorite.link) {
          toast.error("Invalid favorite data")
          return
        }
        newFavorites[favorite.link] = {
          name: favorite.name,
          url: favorite.url,
        }
      })
      setFavorites(newFavorites)
      setIsFavoritesLoading(false)
      setHasFetched(true) // Mark that fetching has occurred
    }

    if (isOpen && !hasFetched) {
      // Only get favorites if sheet is open and we haven't fetched data yet
      getFavs()
    }
  }, [isOpen])

  return (
    <div className="flex justify-center">
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            disabled={loading}
            variant="outline"
            className="flex-1 text-xs md:text-base"
            size={"sm"}
          >
            <div className="flex flex-row items-center justify-center gap-1.5">
              <Heart className="size-4 md:size-5" />
              <span className="text-xs md:text-base">Favorites </span>
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
                      : `(${Object.keys(favorites).length})`}
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
