"use client"

import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Loader, Loader2Icon, Trash2Icon } from "lucide-react"
import { Toaster } from "react-hot-toast"

import FavoritesSheet from "./FavoritesSheet"
import { RecipeCard } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
import RecipesMenu from "./RecipesMenu"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import useRecipeSearch from "./useRecipeSearch"

const SearchRecipes = () => {
  const {
    handleStarIconHover,
    loading,
    loadingMore,
    searchResults,
    input,
    handleInputChange,
    lastFoodItemRef,
    favorites,
    inputChanged,
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick,
    removeFromFavorites,
  } = useRecipeSearch()

  return (
    <div className="relative flex min-h-[80vh] flex-col pb-8 pt-4">
      <RecipeSearchForm
        searchRecipes={searchRecipes}
        handleInputChange={handleInputChange}
        inputChanged={inputChanged}
        input={input}
        loading={loading}
      />

      <RecipesMenu
        removeFromFavorites={removeFromFavorites}
        searchResults={searchResults}
        favorites={favorites}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2Icon className="h-16 w-16 animate-spin" />
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
                favorites={favorites}
                index={index}
                handleStarIconClick={handleStarIconClick}
                hoveredRecipeIndex={hoveredRecipeIndex}
                searchResults={searchResults}
                handleStarIconHover={handleStarIconHover}
              />
            ))}
          </div>

          <div className="mb-4">
            {loadingMore && (
              <div className="p0 relative -my-1 flex flex-col items-center justify-center">
                <div className="absolute -bottom-14 animate-spin">
                  <Loader2Icon className="h-12 w-12" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toaster
        toastOptions={{
          className: "dark:bg-zinc-950 dark:text-slate-100",
          duration: 800,
          success: {
            style: {
              background: "green",
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />
    </div>
  )
}

export default SearchRecipes
