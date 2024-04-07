import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import { extractRecipeName } from "@/lib/utils"

import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card"
import FullTitleToolTip from "./FullTitleToolTip"

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
    <div
      className="relative"
      ref={index === searchResults.hits.length - 8 ? lastFoodItemRef : null}
    >
      <FullTitleToolTip title={extractRecipeName(recipe.recipe.shareAs)}>
        <CardContainer className="inter-var">
          <CardBody className="rounded-xl border border-black/[0.1] bg-gray-50 p-2 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]">
            {/* Title */}
            <div className="flex flex-col items-center justify-end">
              <CardItem
                translateZ="50"
                className="flex h-16 items-center justify-center text-sm font-bold tracking-tight text-neutral-600 dark:text-white md:h-20 md:text-base"
              >
                <div className="line-clamp-3">
                  {extractRecipeName(recipe.recipe.shareAs)}
                </div>
              </CardItem>

              {/* Image */}
              <CardItem translateZ="100" className="flex w-28 justify-center">
                <Image
                  src={recipe.recipe.images.SMALL.url}
                  alt="recipe thumbnail"
                  width={recipe.recipe.images.SMALL.width}
                  height={recipe.recipe.images.SMALL.height}
                  className="rounded-md "
                  unoptimized
                  priority
                />
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>{" "}
      </FullTitleToolTip>
      <StarIcon
        onMouseEnter={handleStarIconHover(index)}
        onMouseLeave={handleStarIconHover(null)}
        color={hoveredRecipeIndex === index ? "#FFA726" : "#FFD700"}
        className="absolute bottom-0 right-0 m-[-0.269rem] cursor-pointer rounded-md p-2 transition-all duration-200 hover:scale-125 hover:animate-pulse"
        fill={
          favorites[extractRecipeName(recipe.recipe.shareAs)]
            ? "#FFA726"
            : "none"
        }
        onClick={handleStarIconClick(index)}
        width={36}
        height={36}
      />
    </div>
  </Link>
)
