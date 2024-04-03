"use client"

import { Separator } from "@radix-ui/react-dropdown-menu"
import { Loader2Icon, Trash2Icon } from "lucide-react"

import { extractRecipeName } from "@/lib/utils"

import FavoritesSheet from "./FavoritesSheet"
import { RecipeCard } from "./RecipeCard"
import { Badge } from "./ui/badge"

const RecipeList = ({
  searchResults,
  loadingMore,
  lastFoodItemRef,
  inputChanged,
  favorites,
  removeFromFavorites,
}) => {
  return (
    <>
      <div
        className={`container flex h-14 items-center justify-between text-sm opacity-100 transition-opacity duration-100`}
      >
        <Badge variant={"outline"} className="p-2">
          <b>{searchResults.count}</b> results
        </Badge>
        <FavoritesSheet>
          <div className="flex h-[92%] flex-col gap-1 overflow-auto rounded-md">
            {favorites &&
              Object.entries(favorites).map(([recipeName, link]) => (
                <a
                  target="_blank"
                  href={link}
                  key={recipeName}
                  className="flex items-center justify-between gap-2 border-t p-2 shadow-lg transition duration-300 ease-in-out hover:underline hover:shadow-lg hover:shadow-fuchsia-900 "
                >
                  {recipeName}
                  <button
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromFavorites(recipeName)
                    }}
                  >
                    <Trash2Icon size={18} />
                    <Separator className="bg-red-900 text-red-500" />
                  </button>
                </a>
              ))}
          </div>
        </FavoritesSheet>
      </div>
      )}
      {searchResults.hits.length > 0 && (
        <div className={`animate-fade-in flex flex-col gap-2 p-4`}>
          <div className={"flex flex-row flex-wrap justify-center gap-2"}>
            {searchResults.hits.map((recipe, index) => (
              <RecipeCard
                key={recipe.recipe.shareAs}
                lastFoodItemRef={lastFoodItemRef}
                recipe={recipe}
                index={index}
                loadingMore={loadingMore}
              />
            ))}
          </div>

          <div className="mb-4">
            {loadingMore && (
              <div className="p0 relative -my-1 flex flex-col items-center justify-center">
                <div className="absolute -bottom-7 animate-spin">
                  <Loader2Icon />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default RecipeList
