"use client"

import { ReactNode, useState } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import { Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { isS3UrlExpired } from "@/lib/helper"
import { extractRecipeName } from "@/lib/utils"

import { getFavorites } from "./actions"
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
  setFavorites,
  isSheetDataLoading,
  setIsSheetDataLoading,
}: {
  children: ReactNode
  setOpen: (isOpen: boolean) => void // Add setOpen to the props interface
  isOpen: boolean
  loading: boolean
  favorites: Favorites
  setFavorites: (setFavorites: Favorites) => void
  isSheetDataLoading: boolean
  setIsSheetDataLoading: (setIsSheetDataLoading: boolean) => void
}) => {
  const theme = useTheme()
  const size = useWindowSize()
  if (!size.width || !size.height) return null

  return (
    <div className="flex justify-center">
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            disabled={loading ? true : false}
            className="flex select-none gap-1 text-base md:text-lg"
            onClick={async () => {
              setIsSheetDataLoading(true)
              setOpen(!isOpen)

              const res = await getFavorites()

              if (!res) return
              const updatedFavorites: Favorites = {}
              res.forEach((favorite) => {
                if (
                  !favorite ||
                  !favorite.name ||
                  !favorite.url ||
                  !favorite.link
                )
                  return
                updatedFavorites[favorite.name] = {
                  link: favorite.link,
                  url: favorite.url,
                }
              })
              setFavorites(updatedFavorites)
              setIsSheetDataLoading(false)
            }}
            size={"sm"}
          >
            <StarIcon
              size={size?.width < 768 ? 19 : 22}
              color={theme.theme === "light" ? "#FFD700" : "black"}
            />
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
