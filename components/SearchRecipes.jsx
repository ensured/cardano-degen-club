"use client"

import { Loader2Icon } from "lucide-react"
import { Toaster } from "react-hot-toast"

import { RecipeCard } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
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
        setSuggestions={setSuggestions}
        suggestions={suggestions}
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
      {searchResults.hits.length > 0 ? (
        <div className="animate-fade-in mb-8 mt-4 flex flex-col gap-4">
          <div className="flex flex-row flex-wrap justify-center gap-4 md:gap-6">
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

          {loadingMore && (
            <div className="relative flex items-center justify-center">
              <div className="absolute animate-spin">
                <Loader2Icon className="size-12 text-gray-500" />
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="p-6 text-center text-gray-600 ">No recipes found</div>
        )
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
