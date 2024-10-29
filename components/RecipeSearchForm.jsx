import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import {
  BookOpen,
  BookOpenCheck,
  Dice1Icon,
  Dice2Icon,
  Dice3Icon,
  Dice4Icon,
  Dice5Icon,
  Dice6Icon,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"

import { foodItems } from "../lib/foods"
import RecipesMenu from "./RecipesMenu"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const diceIcons = [
  Dice1Icon,
  Dice2Icon,
  Dice3Icon,
  Dice4Icon,
  Dice5Icon,
  Dice6Icon,
]

const RecipeSearchForm = ({
  searchRecipes,
  handleInputChange,
  input,
  setInput,
  loading,
  removeFromFavorites,
  favorites,
  setFavorites,
  lastInputSearched,
  userEmail,
  isFavoritesLoading,
  setIsFavoritesLoading,
  searchResults,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { width } = useWindowSize()
  const router = useRouter()

  const inputRef = useRef(null)

  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  const [isHoveredRandomButton, setIsHoveredRandomButton] = useState(false)
  const [diceSpeed, setDiceSpeed] = useState(1600)
  const [currentDiceIndex, setCurrentDiceIndex] = useState(2) // Start with Dice3Icon

  // Dice rotation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDiceIndex((prevIndex) => (prevIndex + 1) % diceIcons.length)
    }, diceSpeed) // Rotate dice based on current speed

    return () => clearInterval(interval) // Cleanup interval on component unmount or when diceSpeed changes
  }, [diceSpeed]) // Depend on diceSpeed only

  // Handle hover state and speed adjustment
  useEffect(() => {
    if (isHoveredRandomButton) {
      setDiceSpeed(1600 / 4) // Speed up when hovering
    } else {
      setDiceSpeed(1600) // Reset speed when hover ends
    }
  }, [isHoveredRandomButton]) // Change diceSpeed on hover state change

  const CurrentDiceIcon = diceIcons[currentDiceIndex] // Get current dice icon based on index

  const handleRandomButtonHover = (isHovered) => {
    setIsHoveredRandomButton(isHovered)
  }

  const handleGetRandomFood = async (e) => {
    try {
      e.preventDefault()
      handleHideKeyboard()
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
    setInput(e.target[0].value)
    searchRecipes(e, e.target[0].value)
    router.push(`?q=${e.target[0].value}`)
    handleHideKeyboard()
  }

  const handleHover = (isOpen) => {
    setIsOpen(isOpen)
  }

  return (
    <div className="mx-0 flex justify-center rounded-md ">
      <div className="w-full max-w-3xl space-y-1">
        <form onSubmit={handleFormSubmit} className="flex gap-1">
          <div className="relative flex w-full flex-col items-center justify-center">
            <Input
              type="text"
              name="searchTerm"
              placeholder="Search for recipes..."
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              className="w-full grow text-sm lg:text-lg"
              enterKeyHint="search"
            />
            {searchResults.count === 0 ? (
              ""
            ) : (
              <div className="animate-fade-in absolute -bottom-0.5 right-0.5 rounded-md text-[0.64rem] text-muted-foreground dark:text-[rgba(255,211,101,0.75)] md:text-[0.66rem] lg:text-[0.71rem]">
                Found {searchResults.count} recipes
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={
              !input || input === "" || loading || lastInputSearched === input
            }
            className="flex items-center justify-center gap-1 text-base md:text-lg"
          >
            <Search className="size-5 md:size-6" />
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-1">
          <Button
            onMouseOver={() => handleRandomButtonHover(true)}
            onMouseOut={() => handleRandomButtonHover(false)}
            onClick={handleGetRandomFood}
            variant="outline"
            size={"sm"}
            className="flex-1 gap-1 text-xs md:text-base"
          >
            <CurrentDiceIcon
              className={`size-4 md:size-5 transition-transform duration-300 ease-in-out 
      ${isHoveredRandomButton ? "text-blue-500 rotate-180 scale-125" : ""}`}
            />
            {width < 440 ? "Random" : "Random Recipe"}
          </Button>
          <RecipesMenu
            favorites={favorites}
            setFavorites={setFavorites}
            removeFromFavorites={removeFromFavorites}
            loading={loading}
            userEmail={userEmail}
            isFavoritesLoading={isFavoritesLoading}
            setIsFavoritesLoading={setIsFavoritesLoading}
            searchResults={searchResults}
          />
          <Link href="/recipe-fren/notepad">
            <Button
              onMouseOver={() => handleHover(true)}
              onMouseOut={() => handleHover(false)}
              disabled={loading}
              className="flex gap-1 text-xs md:text-base"
              variant="outline"
              size={"sm"}
            >
              {isOpen ? (
                <BookOpenCheck className="size-4 md:size-5" />
              ) : (
                <BookOpen className="size-4 md:size-5" />
              )}
              Notepad
            </Button>
          </Link>
        </div>
      </div>

      {/* <div className="ml-1.5 hidden flex-none items-center md:flex">
        <Image
          src={recipeFrenLogo}
          alt="recipe fren logo"
          className="rounded-full"
          width={85} // Set fixed width
          height={85} // Set fixed height
          priority
          placeholder="blur"
          quality={50}
        />
      </div> */}
    </div>
  )
}

export default RecipeSearchForm
