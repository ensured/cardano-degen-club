import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import { extractRecipeName } from "@/lib/utils"

import FullTitleToolTip from "./FullTitleToolTip"
import { Card, CardTitle } from "./ui/card"

export const RecipeCard = ({
  recipe,
  favorites,
  index,
  handleStarIconClick,
  lastFoodItemRef,
  hoveredRecipeIndex,
  searchResults,
  handleStarIconHover,
}) => (
  <Link
    target="_blank"
    key={recipe.recipe.shareAs}
    href={recipe.recipe.shareAs}
  >
    <div className="relative">
      <FullTitleToolTip title={extractRecipeName(recipe.recipe.shareAs)}>
        <Card
          className="xs:w-22 h-52 w-36 grow overflow-hidden sm:w-36 md:w-36"
          ref={index === searchResults.hits.length - 8 ? lastFoodItemRef : null}
        >
          <div className="flex flex-col items-center justify-center">
            <Image
              src={recipe.recipe.images.SMALL.url}
              alt="recipe thumbnail"
              width={recipe.recipe.images.SMALL.width}
              height={recipe.recipe.images.SMALL.height}
              className="mt-0 h-auto w-36 rounded-t-md"
              unoptimized
              priority
            />
            <CardTitle className="xs:text-xs line-clamp-3 flex grow items-center justify-center overflow-hidden whitespace-normal text-center text-sm transition sm:line-clamp-3 md:line-clamp-2 md:text-sm lg:text-sm">
              {extractRecipeName(recipe.recipe.shareAs)}
            </CardTitle>
          </div>
        </Card>
      </FullTitleToolTip>

      <StarIcon
        onMouseEnter={handleStarIconHover(index)}
        onMouseLeave={handleStarIconHover(null)}
        color={hoveredRecipeIndex === index ? "#FFA726" : "#FFD700"}
        className="absolute bottom-0 right-0 h-8 w-8 cursor-pointer rounded-md p-2 transition-all duration-500 hover:scale-125 hover:animate-pulse"
        fill={
          favorites[extractRecipeName(recipe.recipe.shareAs)]
            ? "#FFA726"
            : "none"
        }
        onClick={handleStarIconClick(index)}
      />
    </div>
  </Link>
)
