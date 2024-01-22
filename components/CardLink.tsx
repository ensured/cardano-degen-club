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

function extractRecipeName(url) {
  const recipePath = url.split("/")[4]
  const lastDashIndex = recipePath.lastIndexOf("-")
  const cleanedName =
    lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath

  const capitalizedString = cleanedName
    .split("-")
    .join(" ")
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())

  return capitalizedString
}

export function CardLink({ recipe }) {
  const { shareAs, calories } = recipe.recipe
  console.log(recipe.recipe)

  return (
    <Card className="w-[280px] xs:w-[210px] sm:w-[300px] md:w-[325px] lg:w-[330px] xl:w-[335px] bg-slate-900">
      <CardHeader>
        <div className="flex flex-col items-center gap-2">
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
          <div className="mx-2 flex flex-row justify-between gap-2 py-2">
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
              "h-32 overflow-auto scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-900 dark:scrollbar-track-zinc-900 dark:scrollbar-thumb-gray-100 bg-slate-900 py-1"
            )}
          >
            {recipe.recipe.healthLabels.map((label, index) => (
              <span
                key={label}
                className="inline-block rounded-lg p-1 py-0.75 m-0.5 font-medium dark:bg-slate-500 dark:text-slate-50 bg-slate-800 text-slate-200"
              >
                {label}
              </span>
            ))}
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
