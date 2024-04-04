import React from "react"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Trash2Icon } from "lucide-react"

import FavoritesSheet from "./FavoritesSheet"
import { Badge } from "./ui/badge"

const RecipesMenu = ({ searchResults, favorites, removeFromFavorites }) => {
  return (
    <div
      className={`container flex h-14 items-center justify-between text-sm opacity-100 transition-opacity duration-100 `}
    >
      <>
        {searchResults.count > 0 && (
          <Badge variant={"outline"} className="p-2">
            <b>{searchResults.count}</b> results
          </Badge>
        )}
        <div className="grow"></div>
        <FavoritesSheet>
          <div className="flex h-[94%] flex-col overflow-auto rounded-md">
            <div className="my-2">
              {Object.entries(favorites).map(([recipeName, link]) => (
                <Link
                  target="_blank"
                  href={link}
                  key={recipeName}
                  className="flex items-center justify-between gap-2 border-t px-1 py-0.5 transition duration-300 ease-in-out hover:underline"
                  style={{ textDecoration: "none" }} // Ensure default Link underline is removed
                >
                  <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150 hover:text-[#553C9A]">
                    <span className="rounded-md p-2 decoration-[#553C9A]  hover:shadow-inner ">
                      {recipeName}
                    </span>

                    <button
                      className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
                      onClick={(e) => {
                        e.preventDefault() // prevent default Link click which otherwise would happen
                        removeFromFavorites(recipeName)
                      }}
                    >
                      <Trash2Icon size={18} />
                      <Separator className="bg-red-900 text-red-500" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FavoritesSheet>
      </>
    </div>
  )
}

export default RecipesMenu
