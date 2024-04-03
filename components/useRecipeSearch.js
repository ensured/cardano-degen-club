import { useEffect, useState } from "react";

const useRecipeSearch = (fetchUrl, initialInput, searchParams) => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    hits: [],
    count: 0,
    nextPage: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(fetchUrl);
        if (response.status === 429) {
          toast("Usage limits are exceeded, try again later.", {
            type: "error",
          });
          return;
        }
        const data = await response.json();
        setSearchResults({
          hits: data.hits,
          count: data.count,
          nextPage: data._links.next?.href || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get("q")) {
      fetchData();
    }
  }, [fetchUrl, searchParams]);

  const fetchNextPage = async () => {
    if (searchResults.nextPage) {
      setLoading(true);
      try {
        const response = await fetch(searchResults.nextPage);
        if (!response.ok) {
          throw new Error("Failed to fetch next page");
        }
        const data = await response.json();
        setSearchResults((prevSearchResults) => ({
          ...prevSearchResults,
          hits: [...prevSearchResults.hits, ...data.hits],
          count: data.count,
          nextPage: data._links.next?.href || "",
        }));
      } catch (error) {
        console.error("Error fetching next page:", error);
        toast("Error fetching next page", {
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return { loading, searchResults, fetchNextPage };
};

export default useRecipeSearch;
