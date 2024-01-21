"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { MySkeleton } from "./MySkeleton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const SearchRecipes = () => {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState({})
  const [nextPage, setNextPage] = useState("")
  const [input, setInput] = useState("")
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.NEXT_PUBLIC_APP_ID}&app_key=${process.env.NEXT_PUBLIC_APP_KEY}`
  )

  const [showFoundMessage, setShowFoundMessage] = useState(false)

  const searchRecipes = async (e) => {
    e.preventDefault()
    setRecipes({})
    try {
      setLoading(true)
      const response = await fetch(fetchUrl)
      const data = await response.json()
      setRecipes(data)
      setNextPage(data._links.next.href)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNextPageBtn = async () => {
    if (nextPage) {
      try {
        setLoading(true)
        const response = await fetch(nextPage)
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
        console.log(data._links.next.href)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (e) => {
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${e.target.value}`)
    )
    setInput(e.target.value)
  }

  function extractRecipeName(url) {
    const recipePath = url.split("/")[4]
    const lastDashIndex = recipePath.lastIndexOf("-")
    const cleanedName =
      lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath
    return cleanedName
  }

  return (
    <div className="mx-2">
      <form onSubmit={searchRecipes} className="flex gap-2 px-2">
        <Input
          placeholder="search term"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
        />
        <Button type="submit">Search</Button>
      </form>

      {loading &&
        !recipes.hits && ( // Check if loading is true and no recipes
          <div className="flex flex-col items-center justify-center">
            <div className="animate-pulse text-center text-2xl font-bold text-white">
              <div>Loading... 🚀</div>
            </div>
          </div>
        )}

      {recipes.hits?.length > 0 ? (
        <div className="flex flex-row justify-between">
          <ul className="mt-2 rounded-sm">
            {recipes.hits.map((recipe) => (
              <li key={recipe.recipe.shareAs}>
                <Link
                  href={recipe.recipe.shareAs}
                  key={recipe.recipe}
                  className={badgeVariants({ variant: "outline" })}
                >
                  {extractRecipeName(recipe.recipe.shareAs)}
                </Link>
                {/* <p className="text-gray-500">{recipe.recipe.calories} calories</p> */}
              </li>
            ))}
          </ul>
          <div className="flex flex-col-reverse justify-between">
            <Button onClick={handleNextPageBtn}>Next Page</Button>
            <p className={cn("text-primary")}>found {recipes.count} recipes</p>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  )
}

export default SearchRecipes
