"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
// import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { Loader2Icon } from "lucide-react"
import { Toaster } from "react-hot-toast"

import { RecipeCard } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
import RecipesMenu from "./RecipesMenu"
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
    suggestions,
    setSuggestions,
    isRecipeDataLoading,
  } = useRecipeSearch()

  return (
    <div className="relative flex w-full flex-col p-2">
      {/* Background Image component */}

      <div
        className="fixed left-0 top-0 z-10 h-0.5 rounded-r-lg bg-gradient-to-r from-indigo-300 to-indigo-800"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Include the ScrollTooltip component */}
      {/* <ScrollTooltip
        currentCardIndex={currentCardIndex}
        totalCards={searchResults.hits.length}
        totalResults={searchResults.count}
      /> */}

      <div className="my-1 flex items-center justify-center rounded-md py-2">
        <CardTitle className="text-xl text-slate-50 md:text-2xl">
          Recipe Fren
        </CardTitle>
      </div>

      <RecipeSearchForm
        setSuggestions={setSuggestions}
        suggestions={suggestions}
        searchRecipes={searchRecipes}
        handleInputChange={handleInputChange}
        inputChanged={inputChanged}
        input={input}
        setInput={setInput}
        loading={loading}
        setLoading={setLoading}
        setSearchResults={setSearchResults}
        isRecipeDataLoading={isRecipeDataLoading}
      />
      {/* results count + interactive favorites sheet */}
      <RecipesMenu
        userInfo={userInfo}
        isAuthenticated={isAuthenticated}
        removeFromFavorites={removeFromFavorites}
        searchResults={searchResults}
        favorites={favorites}
        setFavorites={setFavorites}
        loading={loading}
        isRecipeDataLoading={isRecipeDataLoading}
      />
      <div className="fixed inset-x-0 top-0 -z-20 h-full w-full overflow-hidden">
        <Image
          src={"/recipe-fren-bg.jpg"}
          alt="recipe background"
          fill
          className=" object-cover"
          sizes="100vw"
        />
      </div>

      {/* loading spinner in the center of the page */}
      {loading ||
        (isRecipeDataLoading && (
          <div className="absolute inset-0 flex min-h-[80vh] items-center justify-center">
            <Loader2Icon className="h-16 w-16 animate-spin" />
          </div>
        ))}
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

          <div className="mb-[2.2rem]">
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
