import { useRef } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

const RecipeSearchForm = ({
  searchRecipes,
  handleInputChange,
  input,
  inputChanged,
  loading,
}) => {
  const inputRef = useRef(null)
  const handleHideKeyboard = () => {
    inputRef.current.blur()
  }
  return (
    <form
      onSubmit={(e) => {
        searchRecipes(e)
        handleHideKeyboard()
      }}
      className="mx-6 flex items-center justify-center gap-2 md:mx-20"
    >
      <Input
        placeholder="search a food"
        type="text"
        name="searchTerm"
        onChange={handleInputChange}
        value={input}
        ref={inputRef}
      />
      <Button
        type="submit"
        className="relative flex w-32 items-center justify-center"
        disabled={!inputChanged}
      >
        <div className="flex items-center justify-center">
          {loading && (
            <Loader2Icon className="absolute right-1 flex h-4 w-4 animate-spin sm:right-2 md:right-3 md:h-5 md:w-5" />
          )}
          <span>Search</span>
        </div>
      </Button>
    </form>
  )
}

export default RecipeSearchForm
