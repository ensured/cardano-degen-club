/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { extractRecipeId, extractRecipeName } from "@/utils/helper"
import { debounce } from "lodash"
// Import debounce from lodash
import toast from "react-hot-toast"

import { MAX_FAVORITES } from "../utils/consts"
import {
  addToFavoritesFirebase,
  removeFavoriteFirebase,
  removeItemsFirebase,
} from "./actions"

const useRecipeSearch = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
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

  const pendingRemovals = useRef(new Set())
  const pendingAdditions = useRef(new Set())

  // todo later
  // const debouncedAddItemsFirebase = useCallback(
  //   debounce(async (items) => {
  //     if (pendingAdditions.current.size === 0) return
  //     const itemsToAdd = Array.from(pendingAdditions.current) // Convert Set to Array
  //     pendingRemovals.current.clear() // Clear the Set for future removals

  //     try {
  //       await addItemsFirebase(itemsToAdd) // Call your server action
  //       toast.success("Favorites removed!")
  //     } catch (error) {
  //       console.error("Batch removal failed:", error)
  //       toast.error("Failed to remove some favorites")
  //     }
  //   }, 500)
  // )

  // Debounce the removal function

  const searchRecipes = useCallback(async (e, q) => {
    setSearchResults({
      hits: [],
      count: 0,
      nextPage: "",
    })
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
        setLastInputSearched(q)
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
        setLastInputSearched(input)
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
    setIsFavoritesLoading(true)
    const storedFavorites = localStorage.getItem("favorites")
    if (!storedFavorites) {
      return
    }
    try {
      if (
        Object.keys(JSON.parse(storedFavorites)).length > 0 &&
        Object.keys(JSON.parse(storedFavorites)).length <= MAX_FAVORITES
      ) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } catch (e) {
      console.error(e)
    }
    setIsFavoritesLoading(false)
  }, [])

  useEffect(() => {
    setIsFavoritesLoading(true)
    if (favorites === {}) return
    if (
      Object.keys(favorites).length > 0 &&
      Object.keys(favorites).length <= MAX_FAVORITES
    ) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    } else {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
    setIsFavoritesLoading(false)
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

  const debouncedReplace = useCallback(
    debounce((value) => {
      router.push(`?q=${value}`)
    }, 300), // Adjust delay as needed
    [router]
  )

  const handleInputChange = (e) => {
    setInput(e.target.value)
    debouncedReplace(e.target.value)
  }

  const handleStarIconHover = (index) => () => {
    setHoveredRecipeIndex(index) // Update hover state on enter/leave
  }

  const debouncedRemoveItemsFirebase = useCallback(
    debounce(async () => {
      if (pendingRemovals.current.size === 0) return

      const itemsToRemove = Array.from(pendingRemovals.current) // Convert Set to Array
      pendingRemovals.current.clear() // Clear the Set for future removals

      try {
        await removeItemsFirebase(itemsToRemove) // Call your server action
        toast.success(
          itemsToRemove.length > 1 ? "Favorites removed!" : "Favorite removed!"
        )
      } catch (error) {
        console.error("Batch removal failed:", error)
        toast.error("Failed to remove some favorites")
      }
    }, 800),
    []
  )

  const removeFromFavorites = async (link) => {
    const prevFavorites = { ...favorites }

    const key = extractRecipeId(link)
    pendingRemovals.current.add(key)

    try {
      setIsFavoritesLoading(true)

      // Optimistically update the favorites state
      delete prevFavorites[link] // Remove the item from the new favorites state
      setFavorites(prevFavorites) // Update state immediately

      debouncedRemoveItemsFirebase()

      setIsFavoritesLoading(false)
    } catch (error) {
      console.error("Error removing from favorites:", error)
      setFavorites(prevFavorites) // Revert to previous state on error
      toast.error(error.message)
      setIsFavoritesLoading(false)
    }
  }

  const handleStarIconClick = (index) => async (e) => {
    e.preventDefault()
    const recipe = searchResults.hits[index].recipe
    const recipeName = extractRecipeName(recipe.shareAs)
    const recipeImage = recipe.image
    const recipeLink = recipe.shareAs
    const isFavorited = favorites[recipeLink] !== undefined
    const updatedFavorites = { ...favorites }

    setIsFavoritesLoading(true)

    if (isFavorited) {
      // Optimistically remove favorite
      delete updatedFavorites[recipeLink]
      setFavorites(updatedFavorites) // Update state immediately
      // Remove from favorites in Firebase immediately
      removeFavoriteFirebase(recipeLink)
    } else {
      // Optimistically add favorite
      updatedFavorites[recipeLink] = {
        name: recipeName,
        link: recipeLink,
        url: recipeImage,
      }
      setFavorites(updatedFavorites) // Update state immediately

      // Add to favorites in Firebase immediately
      try {
        const metadata = {
          contentType: "image/jpeg",
          customMetadata: {
            name: recipeName,
            link: recipeLink,
            url: recipeImage,
          },
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

        // Finalize the update with the actual URL from Firebase
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
        toast.error(error.message)

        // Revert optimistic update
        setFavorites(favorites)
      }
    }

    setIsFavoritesLoading(false) // Ensure loading state is updated
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
