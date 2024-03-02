/* eslint-disable */

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FullTitleToolTip from "@/components/FullTitleToolTip"

function extractRecipeName(url: string) {
  const recipePath = url.split("/")[4]
  const lastDashIndex = recipePath.lastIndexOf("-")
  const cleanedName =
    lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath

  const capitalizedString = cleanedName
    .split("-")
    .join(" ")
    .replace(/(^|\s)\S/g, (char: string) => char.toUpperCase())

  return capitalizedString
}

export function CardLink({ recipe }) {
  const { shareAs, calories } = recipe.recipe

  return (
    <div className="flex flex-wrap md:w-full">
      <FullTitleToolTip title={extractRecipeName(shareAs)}>
        <Card className="md:w-56 sm:w-36 xs:w-22 w-36 flex-grow overflow-hidden h-52 dark:hover:bg-zinc-900  hover:bg-orange-200">
          {/* Set a fixed height */}
          <div className="flex flex-col justify-center items-center p-2 ">
            <Image
              src={recipe.recipe.images.SMALL.url}
              alt="recipe thumbnail"
              width={recipe.recipe.images.SMALL.width}
              height={recipe.recipe.images.SMALL.height}
              className="w-36 h-auto rounded-2xl p-2"
            />
            <CardTitle className="overflow-hidden flex-grow whitespace-normal line-clamp-3 sm:line-clamp-3 md:line-clamp-2  text-center transition xs:text-xs text-sm md:text-sm lg:text-sm">
              {extractRecipeName(shareAs)}
            </CardTitle>
          </div>
        </Card>
      </FullTitleToolTip>
    </div>
  )
}

export default CardLink
