"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Loader2Icon, StarIcon, Trash2Icon } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

import FullTitleToolTip from "@/components/FullTitleToolTip"

import FavoritesSheet from "./FavoritesSheet"
import { RecipeCard } from "./RecipeCard"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardTitle } from "./ui/card"
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
    <div className="flex flex-col pt-4">
      <form
        onSubmit={searchRecipes}
        className="container flex items-center justify-center gap-2"
      >
        <Input
          placeholder="search term"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
          value={input}
        />
        <Button
          type="submit"
          className="relative flex w-32 items-center justify-center"
          disabled={!inputChanged}
        >
          <div className="flex items-center justify-center">
            {loading && (
              <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
            )}
            <span>Search</span>
          </div>
        </Button>
      </form>

      {searchResults.count > 0 ? (
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
                      e.preventDefault()
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
                <div className="absolute -bottom-7 animate-spin">
                  <Loader2Icon />
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
