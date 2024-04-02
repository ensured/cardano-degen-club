"use client"

import { Label } from "@radix-ui/react-label"
import { BookmarkPlus, StarIcon } from "lucide-react"

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

const FavoritesSheet = ({ children }) => {
  return (
    <div className="container flex justify-end">
      <Sheet key={"right"}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 "
          >
            Favorites <BookmarkPlus />
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              {children}
            </div>
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
