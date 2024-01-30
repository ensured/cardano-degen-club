/* eslint-disable */

import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
} from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
// @ts-ignore
export function CardLink({ recipe }) {
  const { shareAs, calories } = recipe.recipe

  return (
    <div className="flex flex-wrap md:w-full">
      <Card className="w-48 sm:w-36 md:w-56 flex-grow overflow-hidden ">
        <div className="flex flex-col justify-center items-center p-2 hover:bg-zinc-900">
          <CardTitle className="text-md overflow-ellipsis whitespace-normal text-center">
            {extractRecipeName(shareAs)}
          </CardTitle>
          <Image
            src={recipe.recipe.images.SMALL.url}
            alt="recipe thumbnail"
            width={recipe.recipe.images.SMALL.width}
            height={recipe.recipe.images.SMALL.height}
            className="w-40 h-40 rounded-md p-2"
          />
        </div>
      </Card>
    </div>
  )
}

export default CardLink
