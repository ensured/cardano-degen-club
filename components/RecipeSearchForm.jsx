import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import {
  ArrowDown,
  BookOpen,
  BookOpenCheck,
  Dice1Icon,
  Dice2Icon,
  Dice3Icon,
  Dice4Icon,
  Dice5Icon,
  Dice6Icon,
  Search,
  Settings,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

import { foodItems } from "../lib/foods"
import RecipesMenu from "./RecipesMenu"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Checkbox } from "./ui/checkbox"
import useIsMobile from "../hooks/useIsMobile"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const MAX_EXCLUDED_INGREDIENTS = 10

const diceIcons = [
  Dice1Icon,
  Dice2Icon,
  Dice3Icon,
  Dice4Icon,
  Dice5Icon,
  Dice6Icon,
]

const healthOptions = [
  "alcohol-cocktail",
  "alcohol-free",
  "celery-free",
  "crustacean-free",
  "dairy-free",
  "DASH",
  "egg-free",
  "fish-free",
  "fodmap-free",
  "gluten-free",
  "immuno-supportive",
  "keto-friendly",
  "kidney-friendly",
  "kosher",
  "low-fat-abs",
  "low-potassium",
  "low-sugar",
  "lupine-free",
  "Mediterranean",
  "mollusk-free",
  "mustard-free",
  "no-oil-added",
  "paleo",
  "peanut-free",
  "pescatarian",
  "pork-free",
  "red-meat-free",
  "sesame-free",
  "shellfish-free",
  "soy-free",
  "sugar-conscious",
  "sulfite-free",
  "tree-nut-free",
  "vegan",
  "vegetarian",
  "wheat-free",
]

const mealTypes = ["Breakfast", "Dinner", "Lunch", "Snack", "Teatime"]

const RecipeSearchForm = ({
  searchRecipes,
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
  const [selectedHealthOptions, setSelectedHealthOptions] = useState([])
  const [excludedIngredients, setExcludedIngredients] = useState([])
  const [newExcludedItem, setNewExcludedItem] = useState("")

  const [isOpen, setIsOpen] = useState(false)
  const { width } = useWindowSize()
  const router = useRouter()
  const inputRef = useRef(null)

  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  const isMobile = useIsMobile()

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
      searchRecipes(
        e,
        randomFoodItem,
        selectedHealthOptions.length > 0 ? selectedHealthOptions : undefined,
        excludedIngredients.length > 0 ? excludedIngredients : undefined,
        selectedMealType ? selectedMealType : undefined
      )
      router.push(`?q=${randomFoodItem}`)
    } catch (error) {
      toast(error.message, {
        type: "error",
      })
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    setInput(e.target[0].value)
    searchRecipes(
      e,
      e.target[0].value,
      selectedHealthOptions.length > 0 ? selectedHealthOptions : undefined,
      excludedIngredients.length > 0 ? excludedIngredients : undefined,
      selectedMealType ? selectedMealType : undefined
    )
    router.push(`?q=${e.target[0].value}`)
    handleHideKeyboard()
  }

  const handleHover = (isOpen) => {
    setIsOpen(isOpen)
  }

  const handleAddExcludedItem = (e) => {
    e.preventDefault()
    if (
      newExcludedItem.trim() &&
      !excludedIngredients.includes(newExcludedItem.trim())
    ) {
      const newExcludedIngredients = [
        ...excludedIngredients,
        newExcludedItem.trim(),
      ]
      setExcludedIngredients(newExcludedIngredients)
      setNewExcludedItem("")

      // Update URL params
      const params = new URLSearchParams(window.location.search)
      // Clear existing excluded params
      params.delete("excluded")
      // Add each excluded ingredient as a separate parameter
      newExcludedIngredients.forEach((ingredient) => {
        params.append("excluded", ingredient)
      })
      router.push(`?${params.toString()}`, { shallow: true })
    }
  }

  const handleRemoveExcludedItem = (item) => {
    const newExcludedIngredients = excludedIngredients.filter((i) => i !== item)
    setExcludedIngredients(newExcludedIngredients)

    // Update URL params
    const params = new URLSearchParams(window.location.search)
    // Clear existing excluded params
    params.delete("excluded")
    // Add remaining ingredients as separate parameters
    if (newExcludedIngredients.length > 0) {
      newExcludedIngredients.forEach((ingredient) => {
        params.append("excluded", ingredient)
      })
    }
    router.push(`?${params.toString()}`, { shallow: true })
  }

  const [selectedMealType, setSelectedMealType] = useState("")

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Move the async function inside useCallback
  const debouncedFetchSuggestions = useCallback((value) => {
    if (!value) {
      setSuggestions([])
      return
    }

    fetch(`/api/search/autocomplete?q=${encodeURIComponent(value)}`)
      .then((response) => response.json())
      .then(({ data }) => setSuggestions(data))
      .catch((error) => console.error("Failed to fetch suggestions:", error))
  }, [])

  const handleLocalInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    setShowSuggestions(true)
    debouncedFetchSuggestions(value)
  }

  const handleHealthOptionChange = (option, checked) => {
    // Update the selected options in state
    const newSelectedOptions = checked
      ? [...selectedHealthOptions, option]
      : selectedHealthOptions.filter((item) => item !== option)

    setSelectedHealthOptions(newSelectedOptions)

    // Update URL params
    const params = new URLSearchParams(window.location.search)
    const currentHealth = params.get("health")

    if (checked) {
      // Adding new option
      if (currentHealth) {
        params.set("health", `${currentHealth},${option}`)
      } else {
        params.set("health", option)
      }
    } else {
      // Removing option
      if (currentHealth) {
        const healthArray = currentHealth.split(",")
        const filteredHealth = healthArray.filter((item) => item !== option)
        if (filteredHealth.length > 0) {
          params.set("health", filteredHealth.join(","))
        } else {
          params.delete("health")
        }
      }
    }

    router.push(`?${params.toString()}`, { shallow: true })
  }

  const handleSelectSuggestion = (suggestion) => {
    setInput(suggestion)
    setShowSuggestions(false)
    // Trigger search with the selected suggestion
    searchRecipes(
      new Event("submit"),
      suggestion,
      selectedHealthOptions.length > 0 ? selectedHealthOptions : undefined,
      excludedIngredients.length > 0 ? excludedIngredients : undefined,
      selectedMealType ? selectedMealType : undefined
    )
    router.push(`?q=${suggestion}`)
  }

  // Update the radio button handler
  const handleMealTypeChange = (value) => {
    setSelectedMealType(value)
    const params = new URLSearchParams(window.location.search)

    if (value) {
      params.set("mealType", value)
    } else {
      params.delete("mealType")
    }
    router.push(`?${params.toString()}`, { shallow: true })
  }

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search)

    // Load health options
    const healthParam = params.get("health")
    if (healthParam) {
      const healthArray = healthParam.split(",")
      setSelectedHealthOptions(healthArray)
    }

    // Load meal type
    const mealTypeParam = params.get("mealType")
    if (mealTypeParam) {
      setSelectedMealType(mealTypeParam)
    }

    // Load excluded ingredients
    const excludedParams = params.getAll("excluded")
    if (excludedParams.length > 0) {
      setExcludedIngredients(excludedParams)
    }
  }, []) // Empty dependency array means this runs once on mount

  return (
    <div className="mx-0 flex justify-center rounded-md">
      <div className="w-full max-w-3xl space-y-1">
        <form onSubmit={handleFormSubmit} className="flex gap-1">
          <div className="relative flex w-full flex-col items-center justify-center">
            <Input
              type="text"
              name="searchTerm"
              placeholder="Search for a recipe"
              autoFocus={true}
              ref={inputRef}
              value={input}
              onChange={handleLocalInputChange}
              enterKeyHint="search"
              className="h-9 w-full"
            />

            {/* Add autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Command className="absolute top-full z-50 mt-1 h-44 w-full rounded-lg border shadow-md">
                <CommandList>
                  <CommandGroup>
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
            disabled={
              !input || input === "" || loading || lastInputSearched === input
            }
            className="flex items-center justify-center gap-1 text-base md:text-lg"
            size={"sm"}
          >
            <Search className="size-4 md:size-5" />
            Search
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="group relative flex items-center justify-center gap-1 text-sm md:text-base lg:text-lg"
              >
                <Settings className="size-4 group-hover:animate-spin-3-times md:size-5" />
                {isMobile ? "" : "Settings"}
                {(selectedHealthOptions.length > 0 ||
                  excludedIngredients.length > 0 ||
                  selectedMealType) && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-2 -top-2 size-5 rounded-full p-0 text-xs"
                  >
                    {selectedHealthOptions.length +
                      excludedIngredients.length +
                      (selectedMealType ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg text-muted-foreground">
                  Settings
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 py-2">
                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <label>Diet Restrictions</label>
                    {selectedHealthOptions.length > 0 && (
                      <Button
                        onClick={() => {
                          const params = new URLSearchParams(
                            window.location.search
                          )
                          params.delete("health")
                          router.push(`?${params.toString()}`, {
                            shallow: true,
                          })
                          setSelectedHealthOptions([]) // Reset selected health options
                        }}
                        variant="outline"
                        size="sm"
                        className="h-6 w-20 gap-1 text-base"
                      >
                        Clear
                        <X className="size-5" />
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-44 rounded-md border">
                    <div className="px-4 py-3">
                      <div className="relative grid grid-cols-2 gap-2 pl-1">
                        {healthOptions.map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={option}
                              checked={selectedHealthOptions.includes(option)}
                              onCheckedChange={(checked) => {
                                handleHealthOptionChange(option, checked)
                              }}
                            />
                            <label
                              htmlFor={option}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                      {isMobile && (
                        <ArrowDown className="absolute bottom-0 right-0 z-50 flex size-3.5 w-full animate-move-down-up repeat-infinite" />
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <label>Meal Type</label>
                    {selectedMealType && (
                      <Button
                        onClick={() => {
                          const params = new URLSearchParams(
                            window.location.search
                          )
                          params.delete("mealType")
                          router.push(`?${params.toString()}`, {
                            shallow: true,
                          })
                          setSelectedMealType("")
                        }}
                        variant="outline"
                        size="sm"
                        className="h-6 w-20 gap-1 text-base"
                      >
                        Clear
                        <X className="size-5" />
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-24 rounded-md border px-4 py-3">
                    <RadioGroup
                      value={selectedMealType}
                      onValueChange={handleMealTypeChange}
                      className="grid grid-cols-2 gap-2 pl-1"
                    >
                      {mealTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={type.toLowerCase()}
                            id={type}
                          />
                          <Label
                            htmlFor={type}
                            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </ScrollArea>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <label>Excluded Ingredients</label>
                    {excludedIngredients.length > 0 && (
                      <Button
                        onClick={() => {
                          setExcludedIngredients([])
                        }}
                        variant="outline"
                        size="sm"
                        className="h-6 w-20 gap-1 text-base"
                      >
                        Clear
                        <X className="size-5" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Input
                      value={newExcludedItem}
                      onChange={(e) => setNewExcludedItem(e.target.value)}
                      placeholder="Add ingredient to exclude"
                      onKeyDown={(e) => {
                        if (
                          excludedIngredients.length < MAX_EXCLUDED_INGREDIENTS
                        ) {
                          if (e.key === "Enter") {
                            e.preventDefault() // Prevent default form submission
                            if (newExcludedItem.trim()) {
                              handleAddExcludedItem(e)
                            }
                          }
                        }
                      }}
                    />
                    {excludedIngredients.length < MAX_EXCLUDED_INGREDIENTS ? (
                      <Button
                        type="button" // Change type to prevent form submission
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddExcludedItem(e)
                        }}
                      >
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span
                          onClick={() => {
                            setExcludedIngredients([])
                          }}
                          className="flex w-full cursor-pointer items-center text-sm text-muted-foreground hover:text-primary"
                        >
                          Max Limit Hit Click to Clear
                          <Button variant="outline" className="h-8 w-12">
                            <X className="size-4" />
                          </Button>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {excludedIngredients &&
                    excludedIngredients.map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveExcludedItem(item)}
                      >
                        {item}
                      </Badge>
                    ))}
                </div>
              </div>
              <DialogDescription></DialogDescription>
            </DialogContent>
          </Dialog>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-1">
          <Button
            onMouseOver={() => handleRandomButtonHover(true)}
            onMouseOut={() => handleRandomButtonHover(false)}
            onClick={handleGetRandomFood}
            variant="outline"
            size={"sm"}
            className="flex-1 gap-1 text-xs md:text-base lg:text-lg"
          >
            <CurrentDiceIcon
              className={`size-4 transition-transform duration-300 ease-in-out md:size-5 ${isHoveredRandomButton ? "text-blue-500 rotate-180 scale-125" : ""}`}
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
              className="flex gap-1 text-xs md:text-base lg:text-lg"
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
      {/* 
      <div className="ml-1.5 hidden flex-none items-center md:flex">
       gg
      </div> */}
    </div>
  )
}

export default RecipeSearchForm
