"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"

import { CardLink } from "./CardLink"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const Dropdown = ({ options, selectedOption, onSelect }) => {
  return (
    <select
      className="p-2 rounded-md bg-gray-800 text-white focus:outline-none"
      value={selectedOption}
      onChange={(e) => onSelect(e.target.value)}
    >
      {options.map((option) => (
        <option
          className="font-bold text-md bg-gray-800"
          key={option}
          value={option}
        >
          Page: {option}
        </option>
      ))}
    </select>
  )
}

const SearchRecipes = ({ className }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState({})
  const [nextPage, setNextPage] = useState("")
  const searchParams = useSearchParams()
  const [input, setInput] = useState(searchParams.get("q") || "")
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.NEXT_PUBLIC_APP_ID}&app_key=${process.env.NEXT_PUBLIC_APP_KEY}`
  )
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [prevPageDataStack, setPrevPageDataStack] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const lastInputRef = useRef(input)

  const searchRecipes = useCallback(
    async (e) => {
      if (e?.target?.tagName === "FORM") {
        e.preventDefault() // Prevent form submission only if triggered by a form
      }
      if (input !== lastInputRef.current) {
        setPrevPageDataStack([])
        setCurrentPage(1) // Reset current page to 1
      }
      if (input !== searchParams.get("q")) {
        setPrevPageDataStack([]) // Clear the stack for a new query
        setCurrentPage(1) // Reset current page to 1
      }
      setRecipes({})
      try {
        setLoading(true)
        const response = await fetch(fetchUrl)
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
        setPrevPageDataStack((prevStack) => [...prevStack, data])
        setCurrentPage(1)
        router.replace(`?q=${input}`)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchUrl, input, router, searchParams]
  )

  useEffect(() => {
    // Perform initial search only on first load
    if (isInitialLoad && searchParams.get("q")) {
      searchRecipes()
      setIsInitialLoad(false)
    }
  }, [searchParams, searchRecipes, isInitialLoad])

  const handleNextPageBtn = async () => {
    if (nextPage) {
      setLoading(true)
      try {
        const response = await fetch(nextPage, { cache: "force-cache" })
        const data = await response.json()
        const nextPageUrl = data._links.next.href

        // Check if the new page URL is different from the last one in the stack
        if (
          !prevPageDataStack.some(
            (page) => page._links.next.href === nextPageUrl
          )
        ) {
          setRecipes(data)
          setNextPage(nextPageUrl)
          setPrevPageDataStack((prevStack) => [...prevStack, data])
          setCurrentPage((prevPage) => prevPage + 1)
        } else {
          // If the data is the same, update nextPage manually to progress
          // This handles the case when the same page is fetched again
          setNextPage(nextPageUrl)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBackBtn = () => {
    if (prevPageDataStack.length > 1) {
      const prevData = prevPageDataStack[prevPageDataStack.length - 2]
      setRecipes(prevData)
      setNextPage(prevData._links.next.href)
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  const handlePageSelect = (selectedPage) => {
    const selectedPageIndex = parseInt(selectedPage, 10) - 1
    if (
      selectedPageIndex >= 0 &&
      selectedPageIndex < prevPageDataStack.length
    ) {
      setCurrentPage(selectedPageIndex + 1)
      setRecipes(prevPageDataStack[selectedPageIndex])
      setNextPage(prevPageDataStack[selectedPageIndex]._links.next.href)
    }
  }

  const handleInputChange = (e) => {
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${e.target.value}`)
    )
    setInput(e.target.value)
    router.push(`?q=${e.target.value}`)
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

        {loading && !recipes.hits && (
          <div className="flex h-full items-center justify-center">
            {/* ... Loading spinner */}
          </div>
        )}

        {recipes.hits?.length > 0 ? (
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                "container flex items-center gap-2 justify-between py-1"
              )}
            >
              <div className="flex flex-row gap-2">
                <Badge variant={"outline"} className="p-2">
                  <Dropdown
                    options={Array.from(
                      { length: prevPageDataStack.length },
                      (_, i) => i + 1
                    )}
                    selectedOption={currentPage.toString()}
                    onSelect={handlePageSelect}
                  />
                  {recipes.count} results 🎉{" "}
                  {prevPageDataStack.length > 1 &&
                    !isInitialLoad &&
                    currentPage > 1 && (
                      <Button onClick={handleBackBtn}>Back</Button>
                    )}
                </Badge>
              </div>

              {loading && (
                <div className="flex h-full items-center justify-center">
                  {/* ... Loading spinner */}
                </div>
              )}

              <Button onClick={handleNextPageBtn}>Next Page </Button>
            </div>
            <div
              className={cn(
                "flex flex-wrap justify-center gap-4 hover:bg-input sm:flex-col lg:flex-row",
                className
              )}
            >
              {recipes.hits.map((recipe) => (
                <Link
                  target="_blank"
                  key={recipe.recipe.shareAs}
                  href={recipe.recipe.shareAs}
                >
                  <CardLink recipe={recipe} />
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
