import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import { extractRecipeName } from "@/lib/utils"

import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card"
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
    <div
      className="relative"
      ref={index === searchResults.hits.length - 8 ? lastFoodItemRef : null}
    >
      <FullTitleToolTip title={extractRecipeName(recipe.recipe.shareAs)}>
        {/* <Card
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
        </Card> */}
        <CardContainer className="inter-var">
          <CardBody className="group/card relative h-60 w-40 rounded-xl border border-black/[0.1] bg-gray-50 p-6 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]">
            <div className="flex h-full flex-col justify-between">
              {/* Title */}
              <CardItem
                translateZ="50"
                className="line-clamp-3 font-bold leading-6 tracking-tight text-neutral-600 dark:text-white sm:text-lg md:text-xl"
              >
                {extractRecipeName(recipe.recipe.shareAs)}
              </CardItem>

              {/* Image */}
              <CardItem
                translateZ="100"
                className="relative flex justify-center"
              >
                <Image
                  src={recipe.recipe.images.SMALL.url}
                  alt="recipe thumbnail"
                  width={recipe.recipe.images.SMALL.width}
                  height={recipe.recipe.images.SMALL.height}
                  className="mt-0 h-auto w-36 rounded-md"
                  unoptimized
                  priority
                />
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>{" "}
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
      </FullTitleToolTip>
    </div>
  </Link>
)
