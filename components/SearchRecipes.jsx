"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "@/components/ui/badge"
import SelectScrollable from "@/components/SelectScrollable"

import { CardLink } from "./CardLink"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

// const Dropdown = ({ options, selectedOption, onSelect }) => {
//   return (
//     <select
//       className="rounded-md bg-gray-800 p-2 text-white focus:outline-none"
//       value={selectedOption}
//       onChange={(e) => onSelect(e.target.value)}
//     >
//       {options.map((option) => (
//         <option
//           className="text-md bg-gray-800 font-bold"
//           key={option}
//           value={option}
//         >
//           Page: {option}
//         </option>
//       ))}
//     </select>
//   )
// }

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
  const [pageData, setPageData] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const lastInputRef = useRef(input)

  const searchRecipes = useCallback(
    async (e) => {
      if (e?.target?.tagName === "FORM") {
        e.preventDefault() // Prevent form submission only if triggered by a form
      }
      if (input !== lastInputRef.current) {
        setCurrentPage(1) // Reset current page to 1
      }
      if (input !== searchParams.get("q")) {
        setPageData({}) // Clear the page data dictionary for a new query
        setCurrentPage(1) // Reset current page to 1
      }
      setRecipes({})
      try {
        setLoading(true)
        const response = await fetch(fetchUrl)
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
        setPageData((prevPageData) => ({
          ...prevPageData,
          [currentPage]: data,
        }))
        setCurrentPage(1)
        router.replace(`?q=${input}`)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchUrl, input, router, searchParams, currentPage]
  )

  const handleNextPageBtn = async () => {
    if (nextPage) {
      setLoading(true)
      try {
        const response = await fetch(nextPage, { cache: "force-cache" })
        const data = await response.json()
        const nextPageUrl = data._links.next.href

        // Check if the new page URL is different from the last one
        if (
          !pageData[currentPage + 1] ||
          pageData[currentPage + 1]._links.next.href !== nextPageUrl
        ) {
          setPageData((prevPageData) => ({
            ...prevPageData,
            [currentPage + 1]: data,
          }))
          setRecipes(data)
          setNextPage(nextPageUrl)
          setCurrentPage((prevPage) => prevPage + 1)
        } else {
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
    if (currentPage > 1) {
      setRecipes(pageData[currentPage - 1])
      setNextPage(pageData[currentPage - 1]?._links?.next?.href || "")
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  const handlePageSelect = (selectedPage) => {
    const selectedPageIndex = parseInt(selectedPage, 10)
    if (pageData[selectedPageIndex]) {
      setCurrentPage(selectedPageIndex)
      setRecipes(pageData[selectedPageIndex])
      setNextPage(pageData[selectedPageIndex]._links.next.href)
    }
  }

  const handleInputChange = (e) => {
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${e.target.value}`)
    )
    setInput(e.target.value)
    router.push(`?q=${e.target.value}`)
  }

  useEffect(() => {
    // Perform initial search only on first load
    if (isInitialLoad && searchParams.get("q")) {
      searchRecipes()
      setIsInitialLoad(false)
    }
  }, [searchParams, searchRecipes, isInitialLoad])

  return (
    <div className="flex flex-col">
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
              "container flex items-center justify-between gap-2 py-1"
            )}
          >
            <div className="flex flex-row gap-2">
              <Badge variant={"outline"} className="p-2">
                {recipes.count} results 🎉
              </Badge>
              <SelectScrollable
                options={Array.from(
                  { length: Object.keys(pageData).length },
                  (_, i) => i + 1
                )}
                selectedOption={currentPage.toString()}
                onSelect={handlePageSelect}
              />
            </div>

            {loading && (
              <div className="flex h-full items-center justify-center">
                {/* ... Loading spinner */}
              </div>
            )}
            <div className="flex flex-row justify-center gap-2">
              {Object.keys(pageData).length > 1 &&
                !isInitialLoad &&
                currentPage > 1 && (
                  <Button onClick={handleBackBtn}>Prev</Button>
                )}
              <Button onClick={handleNextPageBtn}>Next</Button>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-row flex-wrap justify-center gap-4 hover:bg-input",
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
  )
}

export default SearchRecipes
