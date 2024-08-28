import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import { BookOpen, BookOpenCheck, Search, Shuffle } from "lucide-react"

import { foodItems } from "../lib/foods"
import RecipesMenu from "./RecipesMenu"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const RecipeSearchForm = ({
  searchRecipes,
  handleInputChange,
  input,
  setInput,
  loading,
  setLoading,
  setSuggestions,
  setSearchResults,
  isRecipeDataLoading,
  favorites,
  setFavorites,
  removeFromFavorites,
}) => {
  const router = useRouter()
  const inputRef = useRef(null)
  const suggestionsListRef = useRef(null)

  const { width, height } = useWindowSize()

  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (!suggestionsListRef.current) return
        if (
          inputRef.current &&
          !inputRef.current.contains(event.target) &&
          !suggestionsListRef.current?.contains(event.target)
        ) {
          suggestionsListRef.current.style.display = "none"
        } else {
          suggestionsListRef.current.style.display = "block"
        }
      } catch (e) {
        console.error(e)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => document.removeEventListener("click", handleClickOutside)
  }, [inputRef, suggestionsListRef, setSuggestions]) // Dependencies

  const handleGetRandomFood = async (e) => {
    try {
      setLoading(true)

      e.preventDefault()
      handleHideKeyboard()
      setSearchResults({
        hits: [],
        count: 0,
        nextPage: "",
      })
      const randomIndex = Math.floor(Math.random() * foodItems.length)
      const randomFoodItem = foodItems[randomIndex]
      setInput(randomFoodItem)
      searchRecipes(e, randomFoodItem)
      router.replace(`/recipe-fren?q=${randomFoodItem}`)
    } catch (error) {
      toast(error.message, {
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    setSuggestions([])
    searchRecipes(e)
    handleHideKeyboard()
  }

  const handleSuggestionClick = (e, suggestion) => {
    setSuggestions([])
    setSearchResults({
      hits: [],
      count: 0,
      nextPage: "",
    })
    handleHideKeyboard()
    setInput(suggestion)
    searchRecipes(e, suggestion)
  }

  const [isOpen, setIsOpen] = useState(false)
  const handleHover = (isOpen) => {
    setIsOpen(isOpen)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl space-x-2">
      <div className="grow space-y-2">
        <form onSubmit={handleFormSubmit} className="flex space-x-2">
          <Input
            type="text"
            name="searchTerm"
            placeholder="Search for recipes..."
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            className="grow"
          />
          <Button type="submit" variant="default">
            <Search className="mr-2 size-4 md:text-base text-xs" />
            Search
          </Button>
        </form>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <Button
            onClick={handleGetRandomFood}
            variant="outline"
            className="flex-1 md:text-base text-xs"
          >
            <Shuffle className={`mr-2 size-4`} />
            {/* {width < 440 ? "Random" : "Random Recipe"} */}
            Random Recipe
          </Button>{" "}
          <RecipesMenu
            favorites={favorites}
            setFavorites={setFavorites}
            removeFromFavorites={removeFromFavorites}
            loading={loading}
            isRecipeDataLoading={isRecipeDataLoading}
          />
          {width < 372}
          <Link href="/recipe-fren/notebook">
            <Button
              onMouseOver={() => handleHover(true)}
              onMouseOut={() => handleHover(false)}
              className="md:text-base text-xs"
              variant="outline"
            >
              {isOpen ? (
                <BookOpenCheck className="mr-2 size-4" />
              ) : (
                <BookOpen className="mr-2 size-4" />
              )}
              Notebook
            </Button>
          </Link>
        </div>
      </div>
      {width > 540 && (
        <div className="flex shrink-0 items-center">
          <Image
            src="/logo.jpg"
            alt="recipe fren logo"
            className="grow rounded-md"
            width={86}
            height={86}
          />
        </div>
      )}
    </div>
  )
}

export default RecipeSearchForm
