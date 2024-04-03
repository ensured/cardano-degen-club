import React from "react"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Trash2Icon } from "lucide-react"

import FavoritesSheet from "./FavoritesSheet"
import { Badge } from "./ui/badge"

const RecipesMenu = ({ searchResults, favorites }) => {
  return searchResults.count > 0 ? (
    <div
      className={`container flex h-14 items-center justify-between text-sm opacity-100 transition-opacity duration-100`}
    >
      <Badge variant={"outline"} className="p-2">
        <b>{searchResults.count}</b> results
      </Badge>
      <FavoritesSheet>
        <div className="flex h-[92%] flex-col gap-1 overflow-auto rounded-md">
          {Object.entries(favorites).map(([recipeName, link]) => (
            <Link
              target="_blank"
              href={link}
              key={recipeName}
              className="flex items-center justify-between gap-2 border-t p-2 shadow-lg transition duration-300 ease-in-out hover:underline hover:shadow-lg hover:shadow-fuchsia-900 "
            >
              {recipeName}
              <button
                className="text-red-500 hover:text-red-700 focus:outline-none"
                onClick={(e) => {
                  e.preventDefault() // prevent default Link click which otherwise would happen
                  removeFromFavorites(recipeName)
                }}
              >
                <Trash2Icon size={18} />
                <Separator className="bg-red-900 text-red-500" />
              </button>
            </Link>
          ))}
        </div>
      </FavoritesSheet>
    </div>
  ) : (
    <div
      className={`flex h-4 justify-center pt-1 text-sm opacity-0 transition-opacity duration-150`}
    ></div>
  )
}

export default RecipesMenu
