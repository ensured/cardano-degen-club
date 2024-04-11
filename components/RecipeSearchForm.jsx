import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@uidotdev/usehooks"
import { DicesIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
}) => {
  const router = useRouter()
  const size = useWindowSize()
  const inputRef = useRef(null)
  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  const handleGetRandomFood = async (e) => {
    setLoading(true)
    e.preventDefault()
    handleHideKeyboard()
    setSearchResults({
      hits: [],
      count: 0,
      nextPage: "",
    })
    const data = await fetch(`/api/search/random`).then((data) => data.json())
    const food = data.food
    router.replace(`/recipe-finder?q=${data.food}`)
    setInput(food)
    searchRecipes(e, food)
    return data.food
  }
  const handleFormSubmit = (e) => {
    searchRecipes(e)
    handleHideKeyboard()
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`flex justify-center gap-2 px-4 ${
        size?.width < 460 ? "flex-col" : "flex-row"
      }`}
    >
      <div className="relative">
        <Input
          placeholder="search a food"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
          value={input}
          ref={inputRef}
        />
        {suggestions.length > 0 && (
          <div className="absolute left-0 top-10 z-50 bg-background">
            <ScrollArea className="h-24 rounded-md border">
              <div className="p-2">
                {suggestions.map((suggestion) => {
                  return (
                    <div
                      key={suggestion}
                      onClick={(e) => {
                        setSearchResults({
                          hits: [],
                          count: 0,
                          nextPage: "",
                        })
                        handleHideKeyboard()
                        setInput(suggestion)
                        searchRecipes(e, suggestion)
                      }}
                      className="line-clamp-1 rounded-md px-12 text-sm hover:cursor-pointer hover:bg-secondary"
                    >
                      {suggestion}
                      <Separator className="" />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div
        className={`flex justify-between gap-1 ${
          size?.width < 460 ? "w-full" : ""
        }`}
      >
        <Button
          type="submit"
          className="relative flex w-[6.8rem] select-none items-center justify-center"
          disabled={!inputChanged || loading}
        >
          <div className=" flex items-center justify-center">
            {/* {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:h-5 md:w-5" />
              )} */}
            Search
          </div>
        </Button>
        <Button
          className="select-none gap-1"
          disabled={loading}
          onClick={handleGetRandomFood}
        >
          Random <DicesIcon size={size?.width < 460 ? 16 : 20} />
        </Button>
      </div>
    </form>
  )
}

export default RecipeSearchForm
