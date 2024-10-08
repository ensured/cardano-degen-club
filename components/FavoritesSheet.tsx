"use client"

import { ReactNode } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import { Heart, Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

type Favorites = {
  [name: string]: {
    link: string
    url: string // Assuming image is a URL or similar
  }
}

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
  loading,
  favorites,
  isRecipeDataLoading,
}: {
  children: ReactNode
  setOpen: (isOpen: boolean) => void // Add setOpen to the props interface
  isOpen: boolean
  loading: boolean
  favorites: Favorites
  isRecipeDataLoading: boolean
}) => {
  const theme = useTheme()
  const size = useWindowSize()
  if (!size.width || !size.height) return null

  return (
    <div className="flex justify-center ">
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button  variant="outline" className="flex-1 md:text-base text-xs">
            <Heart className="mr-2 h-4 w-4" />
            Favorites
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
