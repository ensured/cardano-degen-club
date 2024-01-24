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
      <Card className="w-full sm:w-1/2 flex-grow overflow-hidden">
        {/* Use responsive width classes for better adaptability */}
        <div className="w-full md:w-64">
          <CardHeader className="h-58 flex flex-row items-center gap-2">
            <Image
              src={recipe.recipe.images.REGULAR.url}
              alt="recipe thumbnail"
              width={recipe.recipe.images.REGULAR.width}
              height={recipe.recipe.images.REGULAR.height}
              className="w-32 h-32 rounded-full object-cover"
            />
            <CardTitle className="text-md overflow-hidden line-clamp-5 text-wrap">
              {extractRecipeName(shareAs)}
            </CardTitle>
          </CardHeader>
        </div>
      </Card>
    </div>
  )
}

export default CardLink
