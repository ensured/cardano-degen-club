import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"
import { useTheme } from "next-themes"

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
  isMobile,
}) => {
  const { theme } = useTheme()

  return (
    <Link
      target="_blank"
      key={recipe.recipe.shareAs}
      href={recipe.recipe.shareAs}
    >
      <div
        className="relative "
        ref={index === searchResults.hits.length - 8 ? lastFoodItemRef : null}
      >
        <FullTitleToolTip title={extractRecipeName(recipe.recipe.shareAs)}>
          <CardContainer className="inter-var ">
            {/* eslint-disable-next-line tailwindcss/classnames-order */}
            <CardBody className="md:w-72 md:h-72 h-[12.1rem] rounded-xl border border-black/[0.1] bg-gray-50 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]">
              {/* Title */}
              <div className="flex flex-col items-center justify-end">
                <CardItem
                  translateZ="50"
                  className="flex h-16 items-center justify-center p-2 font-bold tracking-tight text-neutral-600 dark:text-white md:h-24 "
                >
                  <div className="line-clamp-3 select-none text-sm md:text-xl">
                    {extractRecipeName(recipe.recipe.shareAs)}
                  </div>
                </CardItem>

                {/* Image */}
                <CardItem
                  translateZ={"100"}
                  className="flex w-28 select-none justify-center md:w-44 "
                >
                  <Image
                    src={recipe.recipe.images.SMALL.url}
                    alt="recipe thumbnail"
                    width={recipe.recipe.images.SMALL.width}
                    height={recipe.recipe.images.SMALL.height}
                    className="rounded-md"
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
          color={
            theme === "light"
              ? hoveredRecipeIndex === index
                ? "#000000"
                : "#18181b"
              : hoveredRecipeIndex === index
              ? "#FFFF00" // Bright yellow
              : "#FFD700" // Golden yellow
          }
          className={`${
            isMobile ? "" : "hover:scale-125"
          } absolute bottom-0 right-0 m-[-0.269rem] h-10 w-10 cursor-pointer select-none rounded-md p-2 transition-all duration-200 md:h-[3.2rem] md:w-[3.2rem]
          `}
          fill={
            favorites[recipe.recipe.shareAs]
              ? "#FFD700" // Orange fill when it's a favorite
              : theme === "light"
              ? "#33333320"
              : "#222222"
          }
          onClick={handleStarIconClick(index)}
        />
      </div>
    </Link>
  )
}
