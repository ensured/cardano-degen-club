/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import _debounce from "lodash/debounce"
import { CheckCircle2Icon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { extractRecipeName } from "@/lib/utils"

import { addFavorite, getFavorites, removeFavorite } from "./actions"

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
  const [input, setInput] = useState(searchParams?.get("q") || "")
  const lastFoodItemRef = useRef()
  const [favorites, setFavorites] = useState({})
  const [hoveredRecipeIndex, setHoveredRecipeIndex] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const searchRecipes = useCallback(async (e, q) => {
    setLoading(true)
    if (q) {
      try {
        const res = await fetch(`/api/search?q=${q}`)

        const data = await res.json()
        if (data.success === false) {
          toast(data.message, { type: "error" })
          return
        }

        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: data.data.hits,
          count: data.data.count,
          nextPage: data.data._links.next?.href || "",
        }))
        setLoading(false)
        return
      } catch (error) {
        setLoading(false)
        toast(error.message, {
          type: "error",
        })
      } finally {
        setSuggestions([])
        setLoading(false)
        router.replace(`?q=${q}`)
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
      setLoading(false)
      router.replace(`?q=${input}`)
    }
  }, [])

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

    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

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

  const handleInputChange = (e) => {
    setInput(e.target.value)
    router.replace(`?q=${e.target.value}`)
  }

  const handleStarIconHover = (index) => () => {
    setHoveredRecipeIndex(index) // Update hover state on enter/leave
  }

  function extractRecipeId(url) {
    const startIndex = url.indexOf("recipe/") + "recipe/".length
    const endIndex = url.indexOf("/", startIndex)
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Invalid URL format")
    }
    return url.substring(startIndex, endIndex)
  }

  const removeFromFavorites = async (recipeLink, name) => {
    try {
      const newFavorites = { ...favorites }
      delete newFavorites[recipeLink]
      setFavorites(newFavorites)
      const removeFav = removeFavorite(extractRecipeId(recipeLink)) // server action

      toast.promise(
        removeFav,
        {
          loading: "Removing",
          success: (data) => <div className="text-white">Removed!</div>,
          error: (error) => "Couldn't remove favorite",
          id: "delete-recipe",
        },
        {
          className: "bg-slate-500/80",
          loading: {
            icon: <Loader2 className="animate-spin text-zinc-950" />,
          },
          success: {
            icon: <CheckCircle2Icon className="animate-fadeIn text-white" />,
          },
        }
      )
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast.error(error.message)
    }
  }

  const handleStarIconClick = (index) => async (e) => {
    e.preventDefault()

    const recipe = searchResults.hits[index].recipe
    const recipeName = extractRecipeName(recipe.shareAs)
    const recipeImage = recipe.image
    const recipeLink = recipe.shareAs

    const isFavorited = favorites[recipeLink] !== undefined

    if (isFavorited) {
      // Remove from favorites optimistically
      const newFavorites = { ...favorites }
      delete newFavorites[recipeLink]
      setFavorites(newFavorites)
      await removeFavorite(extractRecipeId(recipeLink)) // server action
    } else {
      try {
        // Optimistically add to favorites
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [recipeLink]: {
            name: recipeName,
            url: recipeImage,
          },
        }))

        // Add to favorites asynchronously
        const response = await addFavorite({
          name: recipeName,
          url: recipeImage,
          link: recipeLink,
        })

        if (response.error) {
          toast(response.error, { type: "error" })
          // Revert the optimistic update if the asynchronous operation fails
          setFavorites((prevFavorites) => {
            const { [recipeLink]: value, ...newFavorites } = prevFavorites
            return newFavorites
          })
        } else if (response.success) {
          // Display the message to the user
          toast(response.message, { type: "error", duration: 3000 })
          setFavorites((prevFavorites) => {
            const { [recipeLink]: value, ...newFavorites } = prevFavorites
            return newFavorites
          })
        } else {
          // Update favorites with the actual data
          setFavorites((prevFavorites) => ({
            ...prevFavorites,
            [recipeLink]: {
              name: recipeName,
              url: response.preSignedImageUrl,
            },
          }))
        }
      } catch (error) {
        console.error("Error adding favorite:", error)
        toast(error.message, {
          type: "error",
        })
        // Revert the optimistic update if the asynchronous operation fails
        setFavorites((prevFavorites) => {
          const { [recipeLink]: value, ...newFavorites } = prevFavorites
          return newFavorites
        })
      }
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
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick,
    removeFromFavorites,
    scrollProgress,
    currentCardIndex,
    isMobile,
    setSearchResults,
  }
}

export default useRecipeSearch
