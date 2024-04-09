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

import { Button } from "./ui/button"
import { Input } from "./ui/input"

const RecipeSearchForm = ({
  searchRecipes,
  handleInputChange,
  input,
  inputChanged,
  loading,
}) => {
  const size = useWindowSize()
  const inputRef = useRef(null)
  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }

  const handleGetRandomFood = () => {}
  return (
    <form
      onSubmit={(e) => {
        searchRecipes(e)
        handleHideKeyboard()
      }}
      className={`flex items-center justify-center gap-2 px-4 ${
        size?.width < 460 ? "flex-col" : "flex-row"
      }`}
    >
      <Input
        placeholder="search a food"
        type="text"
        name="searchTerm"
        onChange={handleInputChange}
        value={input}
        ref={inputRef}
      />
      {size?.width < 460 ? (
        <div
          className={`flex justify-between gap-1 ${
            size?.width < 460 ? "w-full" : ""
          }`}
        >
          <Button className="gap-1" size={"sm"} onClick={handleGetRandomFood}>
            Random <DicesIcon size={size?.width < 460 ? 16 : 20} />
          </Button>
          <Button
            type="submit"
            className="relative flex w-32 items-center justify-center"
            disabled={!inputChanged}
            size={"sm"}
          >
            <div className="max-w-4 flex items-center justify-center">
              {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
              )}
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
            className="relative flex w-32 items-center justify-center "
            disabled={!inputChanged}
          >
            <div className="flex items-center justify-center">
              {loading && (
                <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
              )}
              Search
            </div>
          </Button>
          <Button className="gap-1" onClick={handleGetRandomFood}>
            Random <DicesIcon size={size?.width < 460 ? 16 : 20} />
          </Button>
        </div>
      )}
    </form>
  )
}

export default RecipeSearchForm
