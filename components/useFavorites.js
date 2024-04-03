import { useState, useEffect } from 'react';

const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) || {};
    } catch (error) {
      return {};
    }
  });

  const addToFavorites = (recipeName, link) => {
    const newFavorites = { ...favorites, [recipeName]: link };
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (recipeName) => {
    const newFavorites = { ...favorites };
    delete newFavorites[recipeName];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  return { favorites, addToFavorites, removeFromFavorites };
};

export default useFavorites;
