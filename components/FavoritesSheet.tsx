"use client"

import { ReactNode, useState } from "react"
import { Label } from "@radix-ui/react-label"
import { useWindowSize } from "@uidotdev/usehooks"
import { Bookmark, BookmarkPlus, Star, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
  loading,
}: {
  children: ReactNode
  setOpen: (isOpen: boolean) => void // Add setOpen to the props interface
  isOpen: boolean
  loading: boolean
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
            className="flex gap-1"
            onClick={() => setOpen(!isOpen)}
            size={"sm"}
          >
            <Star
              size={size?.width > 520 ? 22 : 18}
              color={theme.theme === "light" ? "#FFD700" : "black"}
            />
            Favorites
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-2 p-2 text-2xl md:text-3xl">
                Favorites{" "}
                <StarIcon
                  size={size?.width < 768 ? 26 : 36}
                  color={theme.theme === "light" ? "black" : "#FFD700"}
                />
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
