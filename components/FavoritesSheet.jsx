"use client"

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

// type Favorites = {
//   [name: string]: {
//     link: string
//     url: string // Assuming image is a URL or similar
//   }
// }

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
  loading,
  favorites,
  setFavorites,
}) => {
  const theme = useTheme()
  const size = useWindowSize()
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true)

  useEffect(() => {
    const getFavoritez = async () => {
      const res = await getFavorites()
      if (!res) return

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
    }

    getFavoritez()
  }, [])

  return (
    <div className="flex justify-center">
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        {/*  maybe add ref here? */}
        <SheetTrigger asChild>
          <Button
            disabled={isFavoritesLoading}
            variant="outline"
            className="flex-1 text-xs md:text-base"
          >
            {isFavoritesLoading ? (
              <div className="flex flex-row items-center justify-center gap-[0.25rem]">
                <Loader2 className="size-4 md:size-5 animate-spin" /> Favorites
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center gap-[0.25rem]">
                <Heart className="size-4 md:size-5" />
                <span className="text-xs md:text-base">Favorites</span>
              </div>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-2 text-2xl md:text-3xl ">
                <StarIcon
                  size={size?.width < 768 ? 24 : 33}
                  color={theme.theme === "light" ? "black" : "#FFD700"}
                />
                <div className="flex gap-1 ">
                  Favorites
                  <div className="mt-1 text-xs font-bold md:text-sm">
                    {Object.keys(favorites).length === 0
                      ? ""
                      : `(${Object.keys(favorites).length})`}
                  </div>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {children}

          {/* <SheetFooter>
             <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter> */}
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default FavoritesSheet
