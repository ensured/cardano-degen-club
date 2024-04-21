import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import { DicesIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { foodItems } from "../lib/foods"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const RecipeSearchForm = ({
  searchRecipes,
  handleInputChange,
  input,
  setInput,
  inputChanged,
  loading,
  setLoading,
  suggestions,
  setSuggestions,
  setSearchResults,
  isRecipeDataLoading,
}) => {
  const router = useRouter()
  const size = useWindowSize()
  const inputRef = useRef(null)
  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

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
      router.replace(`/recipe-finder?q=${randomFoodItem}`)
      setInput(randomFoodItem)
      searchRecipes(e, randomFoodItem)
    } catch (error) {
      toast(error.message, {
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    searchRecipes(e)
    handleHideKeyboard()
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`mx-4 mb-1 md:container md:mx-auto`}
    >
      <div className="flex flex-row flex-wrap justify-between  gap-2 md:flex-nowrap md:justify-center">
        {" "}
        <Input
          placeholder="search a food"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
          value={input}
          ref={inputRef}
          className={`${
            suggestions.length > 0 ? "rounded-b-none border-b-0 " : ""
          } w-full`}
        />
        <Button
          type="submit"
          className="relative flex w-[6.8rem] select-none items-center justify-center"
          disabled={!inputChanged || loading || isRecipeDataLoading}
        >
          <div className="flex items-center justify-center text-base md:text-lg">
            {/* {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:h-5 md:w-5" />
              )} */}
            Search
          </div>
        </Button>
        <Button
          className="select-none gap-1 text-base md:text-lg"
          disabled={loading || isRecipeDataLoading}
          onClick={handleGetRandomFood}
        >
          Random <DicesIcon size={size?.width < 768 ? 20 : 24} />
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="absolute left-0 top-10 z-50 bg-background">
          <ScrollArea className="h-24 rounded-b-md border">
            <div className="p-2">
              {suggestions.map((suggestion) => {
                return (
                  <div
                    key={suggestion}
                    onClick={(e) => {
                      setSuggestions([])
                      setSearchResults({
                        hits: [],
                        count: 0,
                        nextPage: "",
                      })
                      handleHideKeyboard()
                      setInput(suggestion)
                      searchRecipes(e, suggestion)
                    }}
                    className="line-clamp-1 min-w-[12rem] border-b pl-1.5 text-sm hover:cursor-pointer hover:underline "
                  >
                    {suggestion}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </form>
  )
}

export default RecipeSearchForm
