"use client"

import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"
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
      className="size-6 cursor-pointer select-none rounded-md p-1 transition-all duration-200 hover:scale-125 md:size-7"
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
    className="size-full rounded-sm border transition-colors hover:bg-muted"
  >
    <Link
      target="_blank"
      href={recipe.recipe.shareAs}
      className="block size-full"
      aria-label={`View recipe for ${recipe.recipe.label}`}
    >
      <FullTitleToolTip title={recipe.recipe.label} className="block size-full">
        <Card className="group flex size-full flex-col border-none transition-colors">
          <CardHeader className="space-y-0 p-1.5 pb-0">
            <div className="flex min-h-[1.8rem] items-center justify-center">
              <h3 className="line-clamp-2 text-center text-xs font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground lg:text-sm">
                {recipe.recipe.label}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="mt-auto flex flex-[2] items-center justify-center p-0.5">
            <Image
              src={recipe.recipe.images.SMALL.url}
              alt={recipe.recipe.label}
              width={80}
              height={80}
              className="w-[51%] rounded-sm object-contain transition-transform duration-200 group-hover:scale-110 sm:w-3/5 md:w-[58%]"
              unoptimized
              priority
            />
          </CardContent>
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
}) => {
  const { theme } = useTheme()

  // Transform data to include favorite status
  const recipesWithFavorites = searchResults.hits.map((recipe) => ({
    ...recipe,
    isFavorite: favorites[recipe.recipe.shareAs],
  }))

  return (
    <div className="mt-2 grid w-full grid-cols-3 gap-1 rounded-md sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
      {recipesWithFavorites.map((recipe, index) => (
        <div
          className="relative aspect-[4/3.5] w-full"
          key={recipe.recipe.shareAs}
        >
          <RecipeCard
            recipe={recipe}
            index={index}
            lastFoodItemRef={lastFoodItemRef}
            searchResults={searchResults}
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
