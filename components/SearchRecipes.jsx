"use client"

import { Loader2, Loader2Icon } from "lucide-react"

import { RecipeCards } from "./RecipeCard"
import RecipeSearchForm from "./RecipeSearchForm"
import useRecipeSearch from "../hooks/useRecipeSearch"

const SearchRecipes = ({ userEmail }) => {
  const {
    handleStarIconHover,
    loading,
    setLoading,
    loadingMore,
    searchResults,
    setSearchResults,
    input,
    setInput,
    lastFoodItemRef,
    favorites,
    setFavorites,
    inputChanged,
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick,
    removeFromFavorites,
    scrollProgress,
    isMobile,
    lastInputSearched,
    isFavoritesLoading,
    setIsFavoritesLoading,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
  } = useRecipeSearch()

  return (
    <div className="relative flex w-full flex-col p-2">
      <div
        className="fixed left-0 top-0 z-10 h-0.5 rounded-r-lg bg-gradient-to-r from-indigo-300 to-indigo-800"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      <RecipeSearchForm
        searchRecipes={searchRecipes}
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
        userEmail={userEmail}
        isFavoritesLoading={isFavoritesLoading}
        setIsFavoritesLoading={setIsFavoritesLoading}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
      />
      {loading && (
        <div className="absolute inset-0 flex min-h-[88vh] items-center justify-center">
          <Loader2Icon className="size-16 animate-spin" />
        </div>
      )}
      {/* Recipe Cards with data */}
      {searchResults.hits && searchResults.hits.length > 0 && (
        <RecipeCards
          searchResults={searchResults}
          lastFoodItemRef={lastFoodItemRef}
          favorites={favorites}
          handleStarIconClick={handleStarIconClick}
          hoveredRecipeIndex={hoveredRecipeIndex}
          handleStarIconHover={handleStarIconHover}
          isMobile={isMobile}
        />
      )}
      <div className="relative flex w-full items-center justify-center pb-6">
        {loadingMore && (
          <Loader2 className="absolute -bottom-1.5 size-6 animate-spin" />
        )}
      </div>
    </div>
  )
}

export default SearchRecipes
