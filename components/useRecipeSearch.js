import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { extractRecipeName } from "@/lib/utils"

const useRecipeSearch = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [suggestions, setSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState({
    hits: [],
    count: 0,
    nextPage: "",
  })
  const searchParams = useSearchParams()
  const [input, setInput] = useState(searchParams.get("q") || "")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastInputSearched, setLastInputSearched] = useState("")
  const lastFoodItemRef = useRef()
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || {}
    } catch (error) {
      return {}
    }
  })
  const [hoveredRecipeIndex, setHoveredRecipeIndex] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const searchRecipes = useCallback(
    async (e, q) => {
      setLoading(true)
      if (q) {
        try {
          const res = await fetch(`/api/search?q=${q}`)
          const data = await res.json()
          if (data.success === false) {
            toast(data.message, { type: "error" })
            return
          }

          if (q !== lastInputSearched) {
            // Clear all results in state if input changes
            setSearchResults((prevSearchResults) => ({
              hits: data.data.hits,
              count: data.data.count,
              nextPage: data.data._links.next?.href || "",
            }))

            setLoading(false)
            return
          } else {
            setSearchResults((prevSearchResults) => ({
              ...prevSearchResults,
              hits: data.data.hits,
              count: data.data.count,
              nextPage: data.data._links.next?.href || "",
            }))
            setLoading(false)
            return
          }
        } catch (error) {
          console.log(error)
          toast(error.message, {
            type: "error",
          })
        } finally {
          setSuggestions([])
          setLoading(false)
          router.replace(`?q=${q}`)
          setLastInputSearched(q)
        }
      }



      if (e?.target?.tagName === "FORM") {
        e.preventDefault()
        setSearchResults({
          hits: [],
          count: 0,
          nextPage: "",
        })
      }

      try {
        const res = await fetch(`/api/search?q=${input}`)
        const data = await res.json()
        if (data.success === false) {
          toast(data.message, { type: "error" })
          return
        }

        if (input !== lastInputSearched) {
          // Clear all results in state if input changes
          setSearchResults((prevSearchResults) => ({
            hits: data.data.hits,
            count: data.data.count,
            nextPage: data.data._links.next?.href || "",
          }))
        } else {
          setSearchResults((prevSearchResults) => ({
            ...prevSearchResults,
            hits: data.data.hits,
            count: data.data.count,
            nextPage: data.data._links.next?.href || "",
          }))
        }


      } catch (err) {
        console.log(err)
      } finally {
        setSuggestions([])
        setLoading(false)
        router.replace(`?q=${input}`)
        setLastInputSearched(input)
      }
    },
    [input, lastInputSearched, router]
  )

  const inputChanged = input !== lastInputSearched && input.length > 0

  const handleLoadNextPage = useCallback(async () => {
    setLoadingMore(true)
    const { nextPage } = searchResults
    if (nextPage) {
      try {
        const response = await fetch(`/api/search?nextPage=${nextPage}`)
        const data = await response.json()
        if (data.success === false) {
          toast(data.message, { type: "error" })
          return
        }

        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: [...prevSearchResults.hits, ...data.hits],
          count: data.count,
          nextPage: data._links.next?.href || "",
        }))
      } catch (error) {
        toast(error.message, {
          type: "error",
        })
      } finally {
        setLoadingMore(false)
      }
    }
  }, [searchResults])

  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }

    checkIsMobile()

    // Add resize event listener to check for changes in device type
    window.addEventListener("resize", checkIsMobile)

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  useEffect(() => {
    // Perform initial search only if q searchParam exists and input is not empty
    try {
      if (isInitialLoad && searchParams.get("q")) {
        searchRecipes()
        setIsInitialLoad(false)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsInitialLoad(false)
    }
  }, [searchParams, searchRecipes, isInitialLoad, input])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / scrollHeight) * 100
      setScrollProgress(progress)

      const totalCards = searchResults.hits.length
      const maxIndex = totalCards - 1
      const currentIndex = Math.min(
        Math.round((progress / 100) * maxIndex),
        maxIndex
      )
      setCurrentCardIndex(currentIndex + 1)
    }

    window.addEventListener("scroll", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [searchResults])

  useEffect(() => {
    // Intersection Observer for the last food item
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          searchResults.nextPage &&
          !loadingMore
        ) {
          handleLoadNextPage()
        }
      },
      { threshold: [0, 0.3] }
    )

    const currentLastFoodItemRef = lastFoodItemRef.current

    if (currentLastFoodItemRef) {
      observer.observe(currentLastFoodItemRef)
    }

    return () => {
      if (currentLastFoodItemRef) {
        observer.unobserve(currentLastFoodItemRef)
      }
    }
  }, [searchResults, handleLoadNextPage, lastFoodItemRef, loadingMore])

  const handleInputChange = async (e) => {
    const newInput = e.target.value
    setInput(newInput)
    router.replace(`?q=${newInput}`)
    if (newInput.length > 1) {
      const { data } = await fetch(`/api/search/autocomplete?q=${newInput}`).then(res => res.json())
      setSuggestions(data)
    } else {
      setSuggestions([])
    }
  }

  const handleStarIconHover = (index) => () => {
    setHoveredRecipeIndex(index) // Update hover state on enter/leave
  }

  const removeFromFavorites = (recipeName) => {
    const newFavorites = { ...favorites }
    delete newFavorites[recipeName]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
    toast("Removed from favorites", {
      icon: <Trash2Icon color="#e74c3c" />,
    })
  }

  const handleStarIconClick = (index) => (e) => {
    e.preventDefault()

    const recipe = searchResults.hits[index].recipe
    const recipeName = extractRecipeName(recipe.shareAs)
    const recipeLink = recipe.shareAs
    const recipeImage = recipe.image // Get the image URL from the recipe object

    // Check if recipe is already favorited
    const isFavorited = favorites[recipeName] !== undefined

    if (isFavorited) {
      // Remove from favorites
      const newFavorites = { ...favorites }
      delete newFavorites[recipeName]
      setFavorites(newFavorites)
      localStorage.setItem("favorites", JSON.stringify(newFavorites))
    } else {
      // Add to favorites
      const newFavorites = {
        ...favorites,
        [recipeName]: { link: recipeLink, image: recipeImage }, // Store both link and image
      }
      setFavorites(newFavorites)
      localStorage.setItem("favorites", JSON.stringify(newFavorites))
    }
  }

  return {
    handleStarIconHover,
    loading,
    setLoading,
    loadingMore,
    searchResults,
    input,
    setInput,
    handleInputChange,
    suggestions,
    setSuggestions,
    lastFoodItemRef,
    favorites,
    setFavorites,
    inputChanged,
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick,
    removeFromFavorites,
    scrollProgress,
    currentCardIndex,
    isMobile,
    setSearchResults
  }
}

export default useRecipeSearch
