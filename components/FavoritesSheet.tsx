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
          <Button className="flex items-center justify-center gap-1">
            <Bookmark className="h-5 w-5" color="#006400" /> Favorites
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-2">
                Favorites <StarIcon size={18} color="#FFD700" />
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-wrap items-center gap-4 overflow-auto rounded-md  bg-zinc-900 p-1 [&::-webkit-slider-runnable-track]:rounded-full ">
            {children}
          </div>
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
