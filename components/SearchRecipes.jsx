"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { throttle } from "throttle-debounce"

import { cn, extractRecipeName } from "@/lib/utils"
import FullTitleToolTip from "@/components/FullTitleToolTip"

import { getRecipes } from "./actions"
import { Button } from "./ui/button"
import { Card, CardTitle } from "./ui/card"
import { Input } from "./ui/input"

const SearchRecipes = ({ className }) => {
  const throttleWindow = 444
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
  const [currentInput, setCurrentInput] = useState("")
  const [lastSuccessfulSearchQuery, setLastSuccessfulSearchQuery] = useState("")
  const lastFoodItemRef = useRef()

  const searchRecipes = useCallback(
    async (e) => {
      if (e?.target?.tagName === "FORM") {
        e.preventDefault()
        setSearchResults({
          hits: [],
          count: 0,
          nextPage: "",
        })
      }
      setLoading(true)
      try {
        const response = await fetch(fetchUrl)
        if (response.status === 429) {
          toast("Usage limits are exceeded, try again later.", {
            type: "error",
          })
          return
        }
        const data = await response.json()
        if (input !== lastSuccessfulSearchQuery) {
          // Reset search results only if the input has changed
          setSearchResults({
            hits: data.hits,
            count: data.count,
            nextPage: data._links.next?.href || "",
          })
          setLastSuccessfulSearchQuery(input)
        } else {
          setSearchResults((prevSearchResults) => ({
            ...prevSearchResults,
            hits: data.hits,
            count: data.count,
            nextPage: data._links.next?.href || "",
          }))
        }

        router.replace(`?q=${input}`)
        setCurrentInput(input)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchUrl, input, lastSuccessfulSearchQuery, router]
  )

  const inputChanged = input !== currentInput

  const handleLoadNextPage = useCallback(async () => {
    const { nextPage } = searchResults
    if (nextPage) {
      setLoadingMore(true)
      try {
        const response = await fetch(nextPage)
        if (!response.ok) {
          throw new Error("Failed to fetch next page")
        }
        const data = await response.json()
        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: [...prevSearchResults.hits, ...data.hits],
          count: data.count,
          nextPage: data._links.next?.href || "",
        }))
      } catch (error) {
        toast("Error fetching next page", {
          type: "error",
        })
      } finally {
        setLoadingMore(false)
      }
    }
  }, [searchResults])

  useEffect(() => {
    // Perform initial search only if q searchParam exists and input is not empty
    try {
      if (isInitialLoad && searchParams.get("q")) {
        searchRecipes()
        setIsInitialLoad(false)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsInitialLoad(false)
    }
  }, [searchParams, searchRecipes, isInitialLoad, input])

  const throttledFetchNextPage = throttle(throttleWindow, handleLoadNextPage, {
    noLeading: true,
    noTrailing: false,
  }) // Throttle handleLoadNextPage

  useEffect(() => {
    // Intersection Observer for the last food item
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          searchResults.nextPage &&
          !loadingMore
        ) {
          throttledFetchNextPage()
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the item is visible
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
  }, [searchResults, throttledFetchNextPage, lastFoodItemRef, loadingMore])

  const handleInputChange = (e) => {
    const newInput = e.target.value
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${newInput}`)
    )
    setInput(newInput)
    router.push(`?q=${newInput}`)
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
        <Button
          type="submit"
          className="relative flex w-32 items-center justify-center"
          disabled={!inputChanged}
        >
          <div className="flex flex-row items-center justify-center">
            {loading && (
              <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
            )}
            <span>Search</span>
          </div>
        </Button>
      </form>
      <div className="flex h-4 justify-center pt-1 text-sm">
        <span>
          {searchResults.count > 0 ? (
            <div>
              <b>{searchResults.count}</b> results
            </div>
          ) : (
            ""
          )}
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
                        index === searchResults.hits.length - 8
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
            <div className="p0 relative -my-1 flex flex-col items-center justify-center">
              <div className="absolute -bottom-7 animate-spin">
                <Loader2Icon />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchRecipes
