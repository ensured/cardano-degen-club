"use client"

import { Loader2Icon } from "lucide-react"
import { Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { RecipeCard } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
import RecipesMenu from "./RecipesMenu"
import ScrollTooltip from "./ScrollToolTip"
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
    scrollProgress,
    currentCardIndex,
    isMobile,
  } = useRecipeSearch()

  return (
    <div className="w-full relative flex flex-col p-2">
      <div
        className="fixed left-0 top-0 z-10 h-1 rounded-lg bg-sky-600"
        style={{ width: `${scrollProgress}%` }}
      ></div>
      <ScrollTooltip
        currentCardIndex={currentCardIndex}
        totalCards={searchResults.hits.length}
      />

      {/* Include the ScrollTooltip component */}
      <RecipeSearchForm
        searchRecipes={searchRecipes}
        handleInputChange={handleInputChange}
        inputChanged={inputChanged}
        input={input}
        loading={loading}
      />
      {/* results count + interactive favorites sheet*/}
      <RecipesMenu
        removeFromFavorites={removeFromFavorites}
        searchResults={searchResults}
        favorites={favorites}
        loading={loading}
      />

      {/* loading spinner in the center of the page */}
      {loading && (
        <div className="absolute inset-0 flex min-h-[80vh] items-center justify-center">
          <Loader2Icon className="h-16 w-16 animate-spin" />
        </div>
      )}
      {/* Recipe Cards with data */}
      {searchResults.hits.length > 0 && (
        <div className="animate-fade-in mb-6 flex flex-col gap-2 pt-1">
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
          duration: 1000,
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
