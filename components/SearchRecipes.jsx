"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"

import { CardLink } from "./CardLink"
import { SkeletonDemo } from "./SkeletonDemo"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const SearchRecipes = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState({})
  const [nextPage, setNextPage] = useState("")
  const searchParams = useSearchParams()
  const [input, setInput] = useState(searchParams.get("q") || "")
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.NEXT_PUBLIC_APP_ID}&app_key=${process.env.NEXT_PUBLIC_APP_KEY}`
  )

  const searchRecipes = useCallback(
    async (e) => {
      try {
        e.preventDefault()
      } catch (err) {
        console.error(err)
      }
      setRecipes({})
      try {
        setLoading(true)
        const response = await fetch(fetchUrl)
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
        router.replace(`?q=${input}`)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchUrl, input, router]
  )

  useEffect(() => {
    const searchTerm = searchParams.get("q")
    setInput(searchTerm || "")
  }, [searchParams]) // Include dependencies

  const handleNextPageBtn = async () => {
    if (nextPage) {
      setLoading(true)
      try {
        const response = await fetch(nextPage, { cache: "force-cache" })
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
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
    router.push(`?q=${e.target.value}`)
  }

  function extractRecipeName(url) {
    const recipePath = url.split("/")[4]
    const lastDashIndex = recipePath.lastIndexOf("-")
    const cleanedName =
      lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath
    return cleanedName
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
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
            // <SkeletonDemo />
            <div className="flex items-center justify-center h-full">
              <Image
                src="https://abs-0.twimg.com/login/img/16/spinner@2x.gif"
                width={16}
                height={16}
                alt="loading"
              />
            </div>
          )}

        {recipes.hits?.length > 0 ? (
          <div className="flex flex-col gap-1">
            <div className={cn("container flex justify-between ")}>
              <Badge variant={"outline"}>{recipes.count} results 🎉</Badge>
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <Image
                    src="https://abs-0.twimg.com/login/img/16/spinner@2x.gif"
                    width={16}
                    height={16}
                    alt="loading"
                  />
                </div>
              )}
              <Button onClick={handleNextPageBtn}>Next Page </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 hover:bg-input sm:flex-col lg:flex-row">
              {recipes.hits.map((recipe) => (
                <Link
                  target="_blank"
                  key={recipe.recipe.shareAs}
                  href={recipe.recipe.shareAs}
                >
                  <CardLink className="mb-4" recipe={recipe} />
                </Link>
              ))}
            </div>
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
