"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookmarkPlus, Loader2Icon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { throttle } from "throttle-debounce"

import { extractRecipeName } from "@/lib/utils"
import FullTitleToolTip from "@/components/FullTitleToolTip"

import FavoritesSheet from "./FavoritesSheet"
import { Button } from "./ui/button"
import { Card, CardTitle } from "./ui/card"
import { Input } from "./ui/input"

const SearchRecipes = () => {
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
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || {}
    } catch (error) {
      return {}
    }
  })

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

  const addToFavorites = (recipeName, link) => {
    const newFavorites = { ...favorites, [recipeName]: link }
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const removeFromFavorites = (recipeName) => {
    const newFavorites = { ...favorites }
    delete newFavorites[recipeName]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
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
          <div className="flex items-center justify-center">
            {loading && (
              <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
            )}
            <span>Search</span>
          </div>
        </Button>
      </form>

      {searchResults.count > 0 ? (
        <div
          className={`flex h-4 justify-center pt-1 text-sm opacity-100 transition-opacity duration-100`}
        >
          <span>
            <b>{searchResults.count}</b> results
          </span>
        </div>
      ) : (
        <div
          className={`flex h-4 justify-center pt-1 text-sm opacity-0 transition-opacity duration-150`}
        ></div>
      )}
      <FavoritesSheet>
        {" "}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 ">
            {Object.entries(favorites).map(([recipeName, link]) => (
              <div
                key={recipeName}
                className="flex select-none items-center gap-1 rounded-md p-2 hover:cursor-pointer hover:bg-slate-900"
              >
                <Link target="_blank" href={link}>
                  {recipeName}
                </Link>
                <Trash2Icon
                  className="hover:text-green"
                  onClick={() => {
                    removeFromFavorites(recipeName)
                    toast("Removed from favorites", {
                      type: "success",
                    })
                  }}
                  size={18}
                  color="#FFD700"
                />
              </div>
            ))}
          </div>
        </div>
      </FavoritesSheet>

      {searchResults.hits.length > 0 && (
        <div className={`animate-fade-in flex flex-col gap-2 p-4`}>
          <div className={"flex flex-row flex-wrap justify-center gap-2"}>
            {searchResults.hits.map((recipe, index) => (
              <Link
                target="_blank"
                key={recipe.recipe.shareAs}
                href={recipe.recipe.shareAs}
              >
                <div className="relative flex flex-wrap md:w-full">
                  <FullTitleToolTip
                    title={extractRecipeName(recipe.recipe.shareAs)}
                  >
                    <Card
                      className="xs:w-22 h-52 w-36 grow overflow-hidden sm:w-36 md:w-56"
                      ref={
                        index === searchResults.hits.length - 8
                          ? lastFoodItemRef
                          : null
                      }
                    >
                      <div className="flex flex-col items-center justify-center pb-1">
                        <Image
                          src={recipe.recipe.images.SMALL.url}
                          alt="recipe thumbnail"
                          width={recipe.recipe.images.SMALL.width}
                          height={recipe.recipe.images.SMALL.height}
                          className="mt-0 h-auto w-36 rounded-t-lg md:mt-2 md:rounded-xl"
                          unoptimized
                          priority
                        />

                        <CardTitle className="xs:text-xs line-clamp-3 flex grow items-center justify-center overflow-hidden whitespace-normal text-center text-sm transition sm:line-clamp-3 md:line-clamp-2 md:text-sm lg:text-sm">
                          {extractRecipeName(recipe.recipe.shareAs)}
                        </CardTitle>
                      </div>
                    </Card>
                  </FullTitleToolTip>

                  <BookmarkPlus
                    className="absolute bottom-0 right-0 m-2 h-10 w-10 rounded-md p-2 transition-all duration-500 hover:cursor-crosshair hover:bg-moon" // Adjust positioning as needed
                    onClick={(e) => {
                      e.preventDefault()

                      console.log(extractRecipeName(recipe.recipe.shareAs))

                      addToFavorites(
                        extractRecipeName(recipe.recipe.shareAs),
                        recipe.recipe.shareAs
                      )
                      toast(`Added to favorites`, {
                        type: "success",
                      })
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="mb-4">
            {loadingMore && (
              <div className="p0 relative -my-1 flex flex-col items-center justify-center">
                <div className="absolute -bottom-7 animate-spin">
                  <Loader2Icon />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchRecipes
