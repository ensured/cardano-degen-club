/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2Icon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { MAX_FAVORITES } from "../utils/consts"
import { addToFavoritesFirebase, removeFavoriteFirebase } from "./actions"

export function extractRecipeName(url) {
  const recipePath = url.split("/")[4]
  const lastDashIndex = recipePath.lastIndexOf("-")
  const cleanedName =
    lastDashIndex !== -1 ? recipePath.substring(0, lastDashIndex) : recipePath

  const capitalizedString = cleanedName
    .split("-")
    .join(" ")
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())

  return capitalizedString
}

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
  const [lastInputSearched, setLastInputSearched] = useState(null)
  const lastFoodItemRef = useRef()
  const [favorites, setFavorites] = useState({})
  const [hoveredRecipeIndex, setHoveredRecipeIndex] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false)

  const searchRecipes = useCallback(async (e, q) => {
    setSearchResults({
      hits: [],
      count: 0,
      nextPage: "",
    })
    setLoading(true)
    if (q) {
      setLastInputSearched(q)
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
        setLoading(false)
        router.replace(`?q=${q}`)
      }
    }

    try {
      setLastInputSearched(input)
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
    const storedFavorites = localStorage.getItem("favorites")
    if (
      Object.keys(JSON.parse(storedFavorites)).length > 0 &&
      Object.keys(JSON.parse(storedFavorites)).length <= 5
    ) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  useEffect(() => {
    if (
      Object.keys(favorites).length > 0 &&
      Object.keys(favorites).length <= 5
    ) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites])

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

  const removeFromFavorites = async (link) => {
    const prevFavorites = { ...favorites }
    try {
      setIsFavoritesLoading(true) // Move this line to the beginning
      const newFavorites = { ...favorites }
      delete newFavorites[link]
      setFavorites(newFavorites)
      const removeFav = removeFavoriteFirebase(link, true)
      setIsFavoritesLoading(false)

      toast.promise(
        removeFav,
        {
          loading: "Removing",
          success: (data) => {
            // Update favorites and localStorage on success
            return <div className="text-white">Removed!</div>
          },
          error: (error) => {
            console.error("Couldn't remove favorite:", error)
            return "Couldn't remove favorite" // You can customize this message if needed
          },
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
      setFavorites(prevFavorites)
      toast.error(error.message)
      setIsFavoritesLoading(false) // This should stay here
    }
  }

  const handleStarIconClick = (index) => async (e) => {
    e.preventDefault()
    const recipe = searchResults.hits[index].recipe
    const recipeName = extractRecipeName(recipe.shareAs)
    const recipeImage = recipe.image
    const recipeLink = recipe.shareAs

    const isFavorited = favorites[recipeLink] !== undefined

    setIsFavoritesLoading(true) // Start loading state

    // Optimistic update for removing favorite
    if (isFavorited) {
      setFavorites((prevFavorites) => {
        const newFavorites = { ...prevFavorites }
        delete newFavorites[recipeLink]
        return newFavorites
      })

      try {
        await removeFavoriteFirebase(recipeLink)
      } catch (error) {
        console.error("Error removing favorite:", error)
        toast("Failed to remove favorite", { type: "error" })
        // Revert the state if remove fails
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [recipeLink]: {
            name: recipeName,
            link: recipeLink,
            url: recipeImage,
          },
        }))
      } finally {
        setIsFavoritesLoading(false) // Ensure loading state is updated
      }
    } else {
      // Optimistic update for adding favorite
      setFavorites((prevFavorites) => ({
        ...prevFavorites,
        [recipeLink]: {
          name: recipeName,
          link: recipeLink,
          url: recipeImage,
        },
      }))

      try {
        const customMetadata = {
          name: recipeName,
          link: recipeLink,
          url: recipeImage,
        }
        const metadata = {
          contentType: "image/jpeg",
          customMetadata,
          cacheControl: "public,max-age=7200",
        }

        const response = await addToFavoritesFirebase({
          name: recipeName,
          link: recipeLink,
          url: recipeImage,
          metadata,
        })

        if (response.error) {
          throw new Error(response.error)
        }

        // Finalize the update with actual URL from Firebase
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [recipeLink]: {
            name: recipeName,
            url: response.url,
            link: recipeLink,
          },
        }))
      } catch (error) {
        console.error("Error adding favorite:", error)
        toast(error.message, { type: "error" })

        // Revert optimistic update
        setFavorites((prevFavorites) => {
          const newFavorites = { ...prevFavorites }
          delete newFavorites[recipeLink]
          return newFavorites
        })
      } finally {
        setIsFavoritesLoading(false) // Ensure loading state is updated
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
    lastInputSearched,
    isFavoritesLoading,
    setIsFavoritesLoading,
  }
}

export default useRecipeSearch
