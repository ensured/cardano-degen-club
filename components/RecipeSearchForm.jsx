import { useEffect, useRef, useState } from "react"
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
  "wheat-free"
]

const mealTypes = ["Breakfast", "Dinner", "Lunch", "Snack", "Teatime"]

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
    if (newExcludedItem.trim() && !excludedIngredients.includes(newExcludedItem.trim())) {
      setExcludedIngredients([...excludedIngredients, newExcludedItem.trim()])
      setNewExcludedItem("")
    }

  }

  const handleRemoveExcludedItem = (item) => {
    setExcludedIngredients(excludedIngredients.filter(i => i !== item))
  }

  const [selectedMealType, setSelectedMealType] = useState("")

  return (
    <div className="mx-0 flex justify-center rounded-md ">
      <div className="w-full max-w-3xl space-y-1">
        <form onSubmit={handleFormSubmit} className="flex gap-1">
          <div className="relative flex w-full flex-col items-center justify-center">
            <Input
              type="text"
              name="searchTerm"
              placeholder="Search for a recipe"
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              enterKeyHint="search"
              className="h-9 w-full"
            />
       
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
                className="flex items-center justify-center gap-1 text-base md:text-lg group"
              >
                <Settings className="size-4 md:size-5 group-hover:animate-spin-once" />
                {isMobile ? "" : "Settings"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg text-muted-foreground">Settings</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-3 py-4">
                <div className="grid gap-1">
                  <div className=" flex items-center justify-between">
                  <label>Diet Restrictions</label>
                    <Button
                      onClick={() => {
                        setSelectedHealthOptions([]) // Reset selected health options
                      }}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={selectedHealthOptions.length === 0}
                    >
                      <X className="size-4"/>
                    </Button>
                  </div>
                  <ScrollArea className="h-44 rounded-md border ">
                    {isMobile && (
                      <ArrowDown className="flex size-3.5 w-full animate-move-down-up items-center justify-center repeat-infinite" />
                    ) }
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 pl-1">
                      {healthOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={option}
                            checked={selectedHealthOptions.includes(option)}
                            onCheckedChange={(checked) => {
                              setSelectedHealthOptions(prev => 
                                checked 
                                  ? [...prev, option]
                                  : prev.filter(item => item !== option)
                              )
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
                      </div>
                    
                  </ScrollArea>
                 
                </div>
                <div className="grid gap-1">
                  <div className=" flex items-center justify-between">
                    <label>Meal Type</label>

                      <Button
                        onClick={() => setSelectedMealType("")}
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={!selectedMealType}
                      >
                        <X className="size-4"/>
                    </Button>
                  </div>
                  <ScrollArea className="h-22 rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-2 pl-1">
                      {mealTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={type}
                            checked={selectedMealType === type.toLowerCase()}
                            onCheckedChange={(checked) => {
                              setSelectedMealType(checked ? type.toLowerCase() : "")
                            }}
                          />
                          <label
                            htmlFor={type}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 -my-1">
                  <label>Excluded Ingredients</label>
                    <Button
                      onClick={() => {
                        setExcludedIngredients([]) // Reset excluded ingredients
                      }}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={excludedIngredients.length === 0}
                    >
                      <X className="size-4"/>
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      value={newExcludedItem}
                      onChange={(e) => setNewExcludedItem(e.target.value)}
                      placeholder="Add ingredient to exclude"
                      disabled={excludedIngredients.length >= MAX_EXCLUDED_INGREDIENTS}
                      onKeyDown={(e) => {
                        if (excludedIngredients.length < MAX_EXCLUDED_INGREDIENTS) {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent default form submission
                            if (newExcludedItem.trim()) {
                              handleAddExcludedItem(e);
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
                          e.preventDefault();
                          handleAddExcludedItem(e);
                        }}
                      >
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center  ">
                        <span onClick={() => {
                            setExcludedIngredients([])
                          }} className="flex w-full cursor-pointer items-center text-sm text-muted-foreground hover:text-primary">Max Limit Hit Click to Clear
                          <Button variant="outline" className="h-8 w-12" >
                            <X className="size-4"/>
                          </Button>
                        </span>
                      </div>
                    ) }
                  </div>
              
                    <div className="flex flex-wrap gap-1">
                      {excludedIngredients && excludedIngredients.map(item => (
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
              <DialogDescription>
               
              </DialogDescription>
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
            className="flex-1 gap-1 text-xs md:text-base"
          >
            <CurrentDiceIcon
              className={`size-4 transition-transform duration-300 ease-in-out md:size-5 
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
{/* 
      <div className="ml-1.5 hidden flex-none items-center md:flex">
       gg
      </div> */}
    </div>
  )
}

export default RecipeSearchForm
