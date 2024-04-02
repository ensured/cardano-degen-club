"use client"

import { ReactNode } from "react"
import { Label } from "@radix-ui/react-label"
import { Bookmark, BookmarkPlus, StarIcon } from "lucide-react"

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

const FavoritesSheet = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex">
      <Sheet key={"right"}>
        <SheetTrigger asChild>
          <Button className="flex gap-1">
            <Bookmark className="h-4 w-4" /> Favorites
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-1 p-2">
                Favorites <StarIcon size={20} color="#FFD700" />
              </div>
            </SheetTitle>
          </SheetHeader>

          {children}

          <SheetFooter>
            {/* <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose> */}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default FavoritesSheet
