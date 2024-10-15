import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import {
  BookOpen,
  BookOpenCheck,
  Dice3Icon,
  Loader2,
  Loader2Icon,
  Search,
} from "lucide-react"

import { foodItems } from "../lib/foods"
import recipeFrenLogo from "../public/recipeFrenLogo.jpg"
import CustomLoader2 from "./CustomLoader2"
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
  removeFromFavorites,
  favorites,
  setFavorites,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { width, height } = useWindowSize()
  const router = useRouter()

  const inputRef = useRef(null)
  const suggestionsListRef = useRef(null)

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
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setSuggestions([])
    setInput(e.target[0].value)
    searchRecipes(e, e.target[0].value)
    router.push(`?q=${e.target[0].value}`)
    handleHideKeyboard()
  }

  const handleHover = (isOpen) => {
    setIsOpen(isOpen)
  }

  return (
    <div className="flex justify-center ">
      <div className="w-full max-w-3xl space-y-1.5">
        <form onSubmit={handleFormSubmit} className="flex gap-1.5">
          <Input
            type="text"
            name="searchTerm"
            placeholder="Search for recipes..."
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            className="grow"
          />
          <Button
            type="submit"
            variant="default"
            disabled={!input || input === "" || loading}
            className="flex items-center gap-1.5"
          >
            <Search className="size-5 md:size-6" />
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <Button
            onClick={handleGetRandomFood}
            variant="outline"
            className="flex-1 gap-1.5 text-xs md:text-base"
          >
            <Dice3Icon className="size-4 md:size-5" />
            {width < 440 ? "Random" : "Random Recipe"}
          </Button>
          <RecipesMenu
            favorites={favorites}
            setFavorites={setFavorites}
            removeFromFavorites={removeFromFavorites}
            loading={loading}
          />
          <Link href="/recipe-fren/notepad">
            <Button
              onMouseOver={() => handleHover(true)}
              onMouseOut={() => handleHover(false)}
              className="flex gap-1.5 text-xs md:text-base"
              variant="outline"
            >
              {isOpen ? (
                <BookOpenCheck className="size-4" />
              ) : (
                <BookOpen className="size-4" />
              )}
              Notepad
            </Button>
          </Link>
        </div>
      </div>

      {width > 540 && (
        <div className="ml-1.5 hidden flex-none items-center md:flex">
          <Image
            src={recipeFrenLogo}
            alt="recipe fren logo"
            className="rounded-full"
            width={85} // Set fixed width
            height={85} // Set fixed height
          />
        </div>
      )}
    </div>
  )
}

export default RecipeSearchForm
