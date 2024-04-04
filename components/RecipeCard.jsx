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
          className="xs:w-22 relative h-52 w-36 grow overflow-hidden sm:w-36 md:w-36"
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
            {/* <div className="absolute inset-0 flex items-center justify-center"></div>{" "} */}
            <div
              className="text-center text-sm font-bold"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
              }}
            >
              {extractRecipeName(recipe.recipe.shareAs)}
            </div>
          </div>
        </Card>
      </FullTitleToolTip>

      <StarIcon
        onMouseEnter={handleStarIconHover(index)}
        onMouseLeave={handleStarIconHover(null)}
        color={hoveredRecipeIndex === index ? "#FFA726" : "#FFD700"}
        className="absolute bottom-0 right-0 h-8 w-8 cursor-pointer rounded-md p-2 transition-all duration-200 hover:scale-125 hover:animate-pulse"
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
