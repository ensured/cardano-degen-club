import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FolderCheck, Trash2Icon } from 'lucide-react';
import { extractRecipeName } from '@/lib/utils';

const useRecipeSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState({
    hits: [],
    count: 0,
    nextPage: '',
  });

  const [input, setInput] = useState(searchParams.get('q') || '');
  const [lastSuccessfulInput, setLastSuccessfulInput] = useState(input);
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.NEXT_PUBLIC_APP_ID}&app_key=${process.env.NEXT_PUBLIC_APP_KEY}`
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastFoodItemRef = useRef();
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) || {};
    } catch (error) {
      return {};
    }
  });
  const [hoveredRecipeIndex, setHoveredRecipeIndex] = useState(null);

  const searchRecipes = useCallback(
    async (e) => {
      try {
        const isFormSubmission = e?.target?.tagName === 'FORM';

        if (isFormSubmission) {
          e.preventDefault();
          setSearchResults({
            hits: [],
            count: 0,
            nextPage: '',
          });
        }
      } catch (e) {
        console.log(e);
      }

      setLoading(true);
      try {
        const response = await fetch(fetchUrl);
        if (response.status === 429) {
          toast('Usage limits are exceeded, try again later.', { type: 'error' });
          return;
        }
        const data = await response.json();
        if (input !== lastSuccessfulInput) {
          // Reset search results only if the input has changed
          setSearchResults({
            hits: data.hits,
            count: data.count,
            nextPage: data._links.next?.href || '',
          });
          setLastSuccessfulInput(input);
        } else {
          setSearchResults((prevSearchResults) => ({
            ...prevSearchResults,
            hits: data.hits,
            count: data.count,
            nextPage: data._links.next?.href || '',
          }));
        }

        router.replace(`?q=${input}`);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchUrl, input, lastSuccessfulInput, router]
  );

  const handleInputChange = useCallback((e) => {
    const newInput = e.target.value;
    setInput(newInput);
    router.push(`?q=${newInput}`);
  }, [router]);

  useEffect(() => {
    if (isInitialLoad && searchParams.get('q')) {
      const initialInput = searchParams.get('q');
      setInput(initialInput);
      setLastSuccessfulInput(initialInput);
      setIsInitialLoad(false);
      searchRecipes({ target: { tagName: 'FORM' } }); // Simulate form submission to trigger initial search
    }
  }, [searchParams, searchRecipes, isInitialLoad]);

  const inputChanged = input !== lastSuccessfulInput;

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const handleStarIconClick = (index) => (e) => {
    e.preventDefault()

    const recipeName = extractRecipeName(
      searchResults.hits[index].recipe.shareAs
    )
    const recipeLink = searchResults.hits[index].recipe.shareAs

    // Check if recipe is already favorited
    const isFavorited = favorites[recipeName] !== undefined

    if (isFavorited) {
      // Remove from favorites
      setFavorites((prevFavorites) => {
        const newFavorites = { ...prevFavorites }
        delete newFavorites[recipeName]
        return newFavorites
      })
      localStorage.setItem("favorites", JSON.stringify(favorites))
      toast("Removed from favorites", {
        icon: <Trash2Icon color="#e74c3c" />,
      })
    } else {
      // Add to favorites
      setFavorites((prevFavorites) => ({
        ...prevFavorites,
        [recipeName]: recipeLink,
      }))
      localStorage.setItem("favorites", JSON.stringify(favorites))
      toast("Added to favorites", {
        icon: <FolderCheck color="#22bb33" />,
      })
    }
  }


  const handleLoadNextPage = useCallback(async () => {
    const { nextPage } = searchResults;
    if (nextPage) {
      setLoadingMore(true);
      try {
        const response = await fetch(nextPage);
        if (!response.ok) {
          throw new Error('Failed to fetch next page');
        }
        const data = await response.json();
        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: [...prevSearchResults.hits, ...data.hits],
          count: data.count,
          nextPage: data._links.next?.href || '',
        }));
      } catch (error) {
        toast('Error fetching next page', { type: 'error' });
      } finally {
        setLoadingMore(false);
      }
    }
  }, [searchResults]);






  const handleStarIconHover = (index) => () => {
    setHoveredRecipeIndex(index) // Update hover state on enter/leave
  }

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
      { threshold: 0.3 } // Trigger when 30% of the item is visible
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

  const removeFromFavorites = (recipeName) => {
    setFavorites((prevFavorites) => {
      const newFavorites = { ...prevFavorites }
      delete newFavorites[recipeName]
      return newFavorites
    })
    localStorage.setItem("favorites", JSON.stringify(favorites))
    toast("Removed from favorites", {
      icon: <Trash2Icon color="#e74c3c" />,
    })
  }

  return {
    handleStarIconHover,
    loading,
    loadingMore,
    searchResults,
    input,
    handleInputChange,
    lastFoodItemRef,
    favorites,
    setFavorites,
    inputChanged,
    searchRecipes,
    hoveredRecipeIndex,
    handleStarIconClick, removeFromFavorites
  };
};

export default useRecipeSearch;
