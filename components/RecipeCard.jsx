"use client"

import Image from "next/image"
import Link from "next/link"
import { Loader2, StarIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import FullTitleToolTip from "./FullTitleToolTip"

// Separate StarButton component for better organization
const StarButton = ({
  recipe,
  index,
  handleClick,
  handleHover,
  hoveredIndex,
  theme,
}) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      handleClick(index)(e)
    }}
    onMouseEnter={() => handleHover(index)}
    onMouseLeave={() => handleHover(null)}
    className="absolute bottom-[0.032rem] right-[0.032rem] z-10"
    aria-label={`Favorite ${recipe.recipe.label}`}
  >
    <StarIcon
      className="size-8 cursor-pointer select-none rounded-md p-1 transition-all duration-200 hover:scale-125"
      fill={
        recipe.isFavorite
          ? "#FFD700"
          : theme === "light"
          ? "#33333320"
          : "#222222"
      }
      color={
        theme === "light"
          ? hoveredIndex === index
            ? "#000000"
            : "#18181b"
          : hoveredIndex === index
          ? "#FFFF00"
          : "#FFD700"
      }
    />
  </button>
)


// Recipe card component with memoization
const RecipeCard = ({ recipe, index, lastFoodItemRef, searchResults }) => (
  <div
    ref={index === searchResults.hits.length - 8 ? lastFoodItemRef : null}
    className="size-full rounded-sm border bg-card transition-colors hover:bg-muted hover:shadow-sm"
  >
    <Link
      target="_blank"
      href={recipe.recipe.shareAs}
      className="flex size-full flex-col justify-center"
      aria-label={`View recipe for ${recipe.recipe.label}`}
    >
      <FullTitleToolTip title={recipe.recipe.label} url={recipe.recipe.url} className="block size-full">
        <Card className="group flex size-full flex-col items-center justify-between border-none shadow-none transition-colors sm:p-2">
          <CardHeader className="w-full space-y-0 p-0.5 [@media(max-width:380px)]:py-0">
            <div className="flex min-h-8 items-center justify-center">
              <h3 className="line-clamp-2 px-1 text-center text-[0.85rem] font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground [@media(min-width:380px)]:text-[1rem] [@media(min-width:430px)]:text-[1.1rem] [@media(min-width:480px)]:text-[1.07rem] [@media(min-width:530px)]:text-[1.09rem] [@media(min-width:580px)]:text-[1.11rem] [@media(min-width:630px)]:text-[1.13rem] [@media(min-width:680px)]:text-[1.15rem] [@media(min-width:730px)]:text-[1.17rem] [@media(min-width:780px)]:text-[1.19rem] [@media(min-width:830px)]:text-[1.21rem]">
                {recipe.recipe.label}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="flex w-full items-center justify-center p-0">
            <Image
              src={recipe.recipe.images.SMALL.url}
              alt={recipe.recipe.label}
              width={80}
              height={80}
              className="w-[48%] rounded-sm object-contain transition-transform duration-200 group-hover:scale-105 sm:w-3/5 "
              unoptimized
              priority
            />
          </CardContent>
          <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
         </div>
        </Card>
      </FullTitleToolTip>
    </Link>
  </div>
)

export const RecipeCards = ({
  searchResults,
  lastFoodItemRef,
  favorites,
  handleStarIconClick,
  hoveredRecipeIndex,
  handleStarIconHover,
  loadingMore,
}) => {
  const { theme } = useTheme()

  // Transform data to include favorite status
  const recipesWithFavorites = searchResults.hits.map((recipe) => ({
    ...recipe,
    isFavorite: favorites[recipe.recipe.shareAs],
  }))

  return (
    <div className="mt-2.5 grid w-full grid-cols-2 gap-1 rounded-md sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {recipesWithFavorites.map((recipe, index) => (
        <div
          className="relative aspect-[4/3] w-full sm:aspect-[4/3.5]"
          key={recipe.recipe.shareAs}
        >
          <RecipeCard
            recipe={recipe}
            index={index}
            lastFoodItemRef={lastFoodItemRef}
            searchResults={searchResults}
            loadingMore={loadingMore}
          />
          <StarButton
            recipe={recipe}
            index={index}
            handleClick={handleStarIconClick}
            handleHover={handleStarIconHover}
            hoveredIndex={hoveredRecipeIndex}
            theme={theme}
          />
        </div>
      ))}
    </div>
  )
}

export default RecipeCards
