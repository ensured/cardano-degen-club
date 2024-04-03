"use client";

import { useState } from "react";
import { getData } from "./_actions";
import Image from "next/image";
import Link from "next/link";
import FullTitleToolTip from "@/components/FullTitleToolTip";
import { Card, CardTitle } from "@/components/ui/card";
import { extractRecipeName } from "@/lib/utils";
import { StarIcon } from "lucide-react";

const Page = () => {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState({
    hits: [],
    count: 0,
    nextPage: ""
  })


  return (
    <div>
      <form action={async (formData) => {
        setLoading(true);
        const data = await getData(formData)
        setRecipes({
          hits: data.hits,
          count: data.count,
          nextPage: data.nextPage
        })
        setLoading(false);
      }} className="flex items-center justify-center" >
        <input type="text" name="searchQuery" />
        <input type="submit" value="Submit" />

      </form>
      <code>
        <pre>
          <div className={"flex flex-row flex-wrap justify-center gap-2"}>
            {recipes.hits.map((recipe, index) => (
              <Link
                target="_blank"
                key={recipe.recipe.shareAs}
                href={recipe.recipe.shareAs}
              >
                <div className="relative flex flex-wrap md:w-full">
                  <FullTitleToolTip
                    title={extractRecipeName(recipe.recipe.shareAs)}
                  >
                    <Card
                      className="xs:w-22 h-52 w-36 grow overflow-hidden sm:w-36 md:w-56"
                    // ref={
                    //   index === recipes.hits.length - 8
                    //     ? lastFoodItemRef
                    //     : null
                    // }
                    >
                      <div className="flex flex-col items-center justify-center pb-1">
                        <Image
                          src={recipe.recipe.images.SMALL.url}
                          alt="recipe thumbnail"
                          width={recipe.recipe.images.SMALL.width}
                          height={recipe.recipe.images.SMALL.height}
                          className="mt-0 h-auto w-36 rounded-t-lg md:mt-2 md:rounded-xl"
                          unoptimized
                          priority
                        />

                        <CardTitle className="xs:text-xs line-clamp-3 flex grow items-center justify-center overflow-hidden whitespace-normal text-center text-sm transition sm:line-clamp-3 md:line-clamp-2 md:text-sm lg:text-sm">
                          {extractRecipeName(recipe.recipe.shareAs)}
                        </CardTitle>
                      </div>
                    </Card>
                  </FullTitleToolTip>

                  {/* <StarIcon
                    onMouseEnter={handleStarIconHover(index)}
                    onMouseLeave={handleStarIconHover(null)}
                    color={hoveredRecipeIndex === index ? "#FFA726" : "#FFD700"}
                    className="absolute bottom-0 right-0 h-8 w-8 cursor-pointer rounded-md p-2 transition-all duration-500 hover:scale-125 hover:animate-pulse"
                    fill={
                      favorites[extractRecipeName(recipe.recipe.shareAs)]
                        ? "#FFA726"
                        : "none"
                    }
                    onClick={handleStarIconClick(index)} // Pass index to function
                  /> */}
                </div>
              </Link>
            ))}
          </div>

          {/* <div className="mb-4">
            {loadingMore && (
              <div className="p0 relative -my-1 flex flex-col items-center justify-center">
                <div className="absolute -bottom-7 animate-spin">
                  <Loader2Icon />
                </div>
              </div>
            )}
          </div> */}
        </pre>
      </code>

    </div>
  )
}

export default Page
