import { useRef } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import {
  Dice1,
  Dice2,
  Dice4,
  Dice6Icon,
  DicesIcon,
  Loader2Icon,
} from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

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
  const size = useWindowSize()
  const inputRef = useRef(null)
  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  const handleGetRandomFood = async () => {
    const data = await fetch(`/api/search/random`).then((data) => data.json())
    return data.food
  }
  return (
    <form
      onSubmit={(e) => {
        setSuggestions([])
        searchRecipes(e)
        handleHideKeyboard()
      }}
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
            <ScrollArea className="h-36 rounded-md border">
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
                        setSuggestions([])
                        handleHideKeyboard()
                        setInput(suggestion)
                        searchRecipes(e, suggestion)
                      }}
                      className="line-clamp-1 p-0.5 text-sm"
                    >
                      {suggestion}
                      <Separator className="my-1" />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {size?.width < 460 ? (
        <div
          className={`flex justify-between gap-1 ${
            size?.width < 460 ? "w-full" : ""
          }`}
        >
          <Button
            className="gap-1"
            size={"sm"}
            onClick={async (e) => {
              e.preventDefault()
              const food = await handleGetRandomFood().then((res) => res.json())
              setSuggestions([])
              handleHideKeyboard()
              setInput(food)
              searchRecipes(e, food)
            }}
          >
            Random <DicesIcon size={size?.width < 460 ? 16 : 20} />
          </Button>
          <Button
            type="submit"
            className="relative flex w-28 items-center justify-center"
            disabled={!inputChanged}
            size={"sm"}
          >
            <div className="max-w-4 flex items-center justify-center">
              {/* {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:h-5 md:w-5" />
              )} */}
              Search
            </div>
          </Button>
        </div>
      ) : (
        <div
          className={`flex justify-between gap-1 ${
            size?.width < 460 ? "w-full" : ""
          }`}
        >
          <Button
            type="submit"
            className="relative flex w-[6.8rem] items-center justify-center "
            disabled={!inputChanged}
          >
            <div className=" flex items-center justify-center">
              {/* {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:h-5 md:w-5" />
              )} */}
              Search
            </div>
          </Button>
          <Button
            className="gap-1"
            onClick={async (e) => {
              setLoading(true)
              e.preventDefault()
              setSuggestions([])
              handleHideKeyboard()
              setSearchResults({
                hits: [],
                count: 0,
                nextPage: "",
              })
              const food = await handleGetRandomFood()
              setInput(food)
              searchRecipes(e, food)
            }}
          >
            Random <DicesIcon size={size?.width < 460 ? 16 : 20} />
          </Button>
        </div>
      )}
    </form>
  )
}

export default RecipeSearchForm
