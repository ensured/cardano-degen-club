"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { cn, extractRecipeName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import FullTitleToolTip from "@/components/FullTitleToolTip"

import { CardLink } from "./CardLink"
import { Button } from "./ui/button"
import { Card, CardTitle } from "./ui/card"
import { Input } from "./ui/input"

const SearchRecipes = ({ className }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false) // State to track loading more data
  const [searchResults, setSearchResults] = useState({
    hits: [],
    count: 0,
    nextPage: "",
  })
  const searchParams = useSearchParams()
  const [input, setInput] = useState(searchParams.get("q") || "")
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.NEXT_PUBLIC_APP_ID}&app_key=${process.env.NEXT_PUBLIC_APP_KEY}`
  )
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const lastFoodItemRef = useRef()

  const searchRecipes = useCallback(
    async (e) => {
      if (e?.target?.tagName === "FORM") {
        e.preventDefault() // Prevent form submission only if triggered by a form
      }
      setLoading(true)
      try {
        const response = await fetch(fetchUrl)
        if (response.status === 429) {
          toast("Error: Usage limits are exceeded", {
            type: "error",
          })
          return
        }
        const data = await response.json()
        setSearchResults({
          hits: data.hits,
          count: data.count,
          nextPage: data._links.next?.href || "",
        })
        router.replace(`?q=${input}`)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchUrl, input, router]
  )

  const handleNextPage = useCallback(async () => {
    const { nextPage } = searchResults
    if (nextPage) {
      setLoadingMore(true) // Set loading more state
      try {
        const response = await fetch(nextPage)
        if (!response.ok) {
          throw new Error("Failed to fetch next page")
        }
        const data = await response.json()
        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: [...prevSearchResults.hits, ...data.hits],
          nextPage: data._links.next?.href || "",
        }))
      } catch (error) {
        console.error("Error fetching next page:", error)
        toast("Error fetching next page", {
          type: "error",
        })
      } finally {
        setLoadingMore(false) // Reset loading more state
      }
    }
  }, [searchResults])

  useEffect(() => {
    // Perform initial search only on first load
    if (isInitialLoad && searchParams.get("q")) {
      searchRecipes()
      setIsInitialLoad(false)
    }
  }, [searchParams, searchRecipes, isInitialLoad])

  useEffect(() => {
    // Intersection Observer for the last food item
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          searchResults.nextPage &&
          !loadingMore
        ) {
          handleNextPage()
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the item is visible
    )

    const currentLastFoodItemRef = lastFoodItemRef.current

    if (currentLastFoodItemRef) {
      observer.observe(currentLastFoodItemRef)
    }

    return () => {
      if (currentLastFoodItemRef) {
        observer.unobserve(currentLastFoodItemRef)
      }
    }
  }, [searchResults, handleNextPage, lastFoodItemRef, loadingMore])

  const handleInputChange = (e) => {
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${e.target.value}`)
    )
    setInput(e.target.value)
    router.push(`?q=${e.target.value}`)
  }

  return (
    <div className="flex flex-col pt-4">
      <form
        onSubmit={searchRecipes}
        className="container flex items-center justify-center gap-2"
      >
        <Input
          placeholder="search term"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
          value={input}
        />
        <Button type="submit" className="w-32">
          <div className="flex flex-row items-center justify-center gap-2">
            Search{" "}
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-dotted border-slate-50 dark:border-slate-900"></div>
            )}
          </div>
        </Button>
      </form>
      <div className="flex h-4 justify-center pt-1 text-sm">
        <span>
          <b>{searchResults.count}</b> results
        </span>
      </div>

      {searchResults.hits.length > 0 && (
        <div className="flex flex-col gap-2 p-4">
          <div
            className={cn(
              "flex flex-row flex-wrap justify-center gap-2",
              className
            )}
          >
            {searchResults.hits.map((recipe, index) => (
              <Link
                target="_blank"
                key={recipe.recipe.shareAs}
                href={recipe.recipe.shareAs}
              >
                <div className="flex flex-wrap md:w-full">
                  <FullTitleToolTip
                    title={extractRecipeName(recipe.recipe.shareAs)}
                  >
                    <Card
                      className="xs:w-22 hover:bg-orange-200 h-52 w-36 grow overflow-hidden dark:hover:bg-zinc-900 sm:w-36  md:w-56"
                      ref={
                        index === searchResults.hits.length - 1
                          ? lastFoodItemRef
                          : null
                      }
                    >
                      <div className="flex flex-col items-center justify-center p-2 ">
                        <Image
                          src={recipe.recipe.images.SMALL.url}
                          alt="recipe thumbnail"
                          width={recipe.recipe.images.SMALL.width}
                          height={recipe.recipe.images.SMALL.height}
                          className="h-auto w-36 rounded-2xl p-2"
                        />
                        <CardTitle className="xs:text-xs line-clamp-3 grow overflow-hidden whitespace-normal text-center  text-sm transition sm:line-clamp-3 md:line-clamp-2 md:text-sm lg:text-sm">
                          {extractRecipeName(recipe.recipe.shareAs)}
                        </CardTitle>
                      </div>
                    </Card>
                  </FullTitleToolTip>
                </div>
              </Link>
            ))}
          </div>
          {loadingMore && (
            <div className="flex w-full flex-col items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-dotted border-slate-900 dark:border-slate-50"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchRecipes
