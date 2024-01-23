"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"

import { CardLink } from "./CardLink"
import Loading, { SkeletonDemo } from "./SkeletonDemo"
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
        const response = await fetch(nextPage, { cache: "force-cache" })
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
    <div className="flex flex-col justify-center ">
      <div>
        <form onSubmit={searchRecipes} className="container flex gap-2">
          <Input
            placeholder="search term"
            type="text"
            name="searchTerm"
            onChange={handleInputChange}
            value={input}
          />
          <Button type="submit">Search</Button>
        </form>

        {loading &&
          !recipes.hits && ( // Check if loading is true and no recipes
            <SkeletonDemo />
          )}

        {recipes.hits?.length > 0 ? (
          <div className="flex flex-col justify-between gap-1">
            <div className="container my-1 flex justify-between">
              <Badge>found {recipes.count} recipes</Badge>
              <Button onClick={handleNextPageBtn}>Next Page</Button>
            </div>
            <ul className="flex flex-wrap justify-center gap-2 hover:bg-input sm:flex-col lg:flex-row">
              {recipes.hits.map((recipe) => (
                <Link
                  target="_blank"
                  key={recipe.recipe.shareAs}
                  href={recipe.recipe.shareAs}
                >
                  <CardLink className="mb-4" recipe={recipe} />
                </Link>
              ))}
            </ul>
            <br />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}

export default SearchRecipes
