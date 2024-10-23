"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useWindowSize } from "@uidotdev/usehooks"
// import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { Loader2Icon } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { toast } from "sonner"

import { foodItems } from "../lib/foods"
import { RecipeCard } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
import ScrollTooltip from "./ScrollToolTip"
import { CardTitle } from "./ui/card"
import useRecipeSearch from "./useRecipeSearch"

const SearchRecipes = ({ isAuthenticated, userInfo }) => {
  const {
    handleStarIconHover,
    loading,
    setLoading,
    loadingMore,
    searchResults,
    setSearchResults,
    input,
    setInput,
    handleInputChange,
    lastFoodItemRef,
    favorites,
    setFavorites,
    inputChanged,
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick,
    removeFromFavorites,
    scrollProgress,
    currentCardIndex,
    isMobile,
    lastInputSearched,
    isFavoritesLoading,
    setIsFavoritesLoading,
  } = useRecipeSearch()

  return (
    <div className="relative flex w-full flex-col p-2">
      {/* Background Image component */}

      <div
        className="fixed left-0 top-0 z-10 h-0.5 rounded-r-lg bg-gradient-to-r from-indigo-300 to-indigo-800"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* <ScrollTooltip
        // currentCardIndex={currentCardIndex}
        // totalCards={searchResults.hits.length}
        // totalResults={searchResults.count}
        favorites={favorites}
      /> */}

      <RecipeSearchForm
        searchRecipes={searchRecipes}
        handleInputChange={handleInputChange}
        inputChanged={inputChanged}
        input={input}
        setInput={setInput}
        loading={loading}
        setLoading={setLoading}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        favorites={favorites}
        setFavorites={setFavorites}
        removeFromFavorites={removeFromFavorites}
        lastInputSearched={lastInputSearched}
        userEmail={userInfo.email}
        isFavoritesLoading={isFavoritesLoading}
        setIsFavoritesLoading={setIsFavoritesLoading}
      />

      {/* loading spinner in the center of the page */}
      {loading && (
        <div className="absolute inset-0 flex min-h-[80vh] items-center justify-center">
          <Loader2Icon className="size-16 animate-spin" />
        </div>
      )}
      {/* Recipe Cards with data */}
      {searchResults.hits.length > 0 && (
        <div className="animate-fade-in mb-6 mt-2 flex flex-col gap-2">
          <div className="flex flex-row flex-wrap justify-center gap-2 md:gap-4">
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
                isMobile={isMobile}
              />
            ))}
          </div>

          <div className="mb-[2.2rem]">
            {loadingMore && (
              <div className="p0 relative -my-1 flex flex-col items-center justify-center">
                <div className="absolute -bottom-14 animate-spin">
                  <Loader2Icon className="size-12" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Toaster
        toastOptions={{
          className: "dark:bg-zinc-950 dark:text-slate-100",
          duration: 1100,
          position: "bottom-center",
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
