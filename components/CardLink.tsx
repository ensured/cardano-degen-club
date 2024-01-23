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
  console.log(recipe.recipe)

  return (
    <Card className="w-[190px] xs:w-[225px] sm:w-[200px] md:w-[240px] lg:w-[310px] xl:w-[320px] bg-slate-900">
      <CardHeader>
        <div className="flex flex-col items-center gap-1">
          <Image
            src={recipe.recipe.images.REGULAR.url}
            alt="recipe thumbnail"
            width={recipe.recipe.images.REGULAR.width}
            height={recipe.recipe.images.REGULAR.height}
            className="rounded-full"
          />
          <CardTitle className="text-slate-100">
            {extractRecipeName(shareAs)}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription>
          <div className="flex flex-row justify-between gap-2 py-2">
            <div className=" bg-slate-700 p-2 rounded-sm text-slate-300">
              source: {recipe.recipe.source}
            </div>
            <div className=" bg-slate-700 p-2 rounded-sm text-slate-300">
              {Math.round(calories)} calories
            </div>
          </div>
        </CardDescription>

        <CardDescription>
          <div
            className={cn(
              "rounded-sm dark:hover:scrollbar-thumb-gray-500 h-32 overflow-auto scrollbar scrollbar-track-gray-600 dark:scrollbar-track-gray-600 scrollbar-thumb-gray-200  dark:scrollbar-thumb-gray-100 bg-slate-800 p-0.5"
            )}
          >
            {recipe.recipe.healthLabels.length > 1 ? (
              recipe.recipe.healthLabels.map(
                (
                  // @ts-ignore

                  label
                ) => (
                  <span
                    key={label}
                    className="rounded-sm flex flex-col flex-wrap text-center font-medium bg-slate-500 text-slate-50 mb-1 p-1"
                  >
                    {label}
                  </span>
                )
              )
            ) : (
              <span className="rounded-sm flex flex-col flex-wrap text-center font-medium bg-red-900 opacity-70 text-slate-50 mb-1 p-1">
                No labels found
              </span>
            )}
          </div>
        </CardDescription>
      </CardContent>

      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  )
}

export default CardLink
