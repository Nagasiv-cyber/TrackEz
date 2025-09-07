import { useState, useEffect, useCallback } from 'react';
import { apiService, UserFavorites } from '../services/api';

// For demo purposes, we'll use a fixed user ID
const DEMO_USER_ID = 'demo_user_123';

export function useUserFavorites() {
  const [favorites, setFavorites] = useState<UserFavorites>({
    routes: [],
    stops: [],
    buses: []
  });
  const [loading, setLoading] = useState(true);

  // Load user favorites
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const userFavorites = await apiService.getFavorites(DEMO_USER_ID);
      setFavorites(userFavorites);
    } catch (err) {
      // Use localStorage as fallback - expected in demo mode
      try {
        const localFavorites = localStorage.getItem('bus_tracker_favorites');
        if (localFavorites) {
          const parsed = JSON.parse(localFavorites);
          // Ensure the structure is valid
          setFavorites({
            routes: Array.isArray(parsed.routes) ? parsed.routes : [],
            stops: Array.isArray(parsed.stops) ? parsed.stops : [],
            buses: Array.isArray(parsed.buses) ? parsed.buses : []
          });
        }
      } catch (parseErr) {
        // Keep default empty structure - no need to log this
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add favorite
  const addFavorite = useCallback(async (type: 'route' | 'stop' | 'bus', id: string) => {
    try {
      const updatedFavorites = await apiService.addFavorite(DEMO_USER_ID, type, id);
      setFavorites(updatedFavorites);
      localStorage.setItem('bus_tracker_favorites', JSON.stringify(updatedFavorites));
    } catch (err) {
      // Use local storage as fallback - expected in demo mode
      const pluralType = `${type}s` as keyof UserFavorites;
      const currentArray = favorites[pluralType] || [];
      const newFavorites = {
        ...favorites,
        [pluralType]: [...currentArray, id]
      };
      setFavorites(newFavorites);
      localStorage.setItem('bus_tracker_favorites', JSON.stringify(newFavorites));
    }
  }, [favorites]);

  // Remove favorite
  const removeFavorite = useCallback((type: 'route' | 'stop' | 'bus', id: string) => {
    const pluralType = `${type}s` as keyof UserFavorites;
    const currentArray = favorites[pluralType] || [];
    const newFavorites = {
      ...favorites,
      [pluralType]: currentArray.filter(item => item !== id)
    };
    setFavorites(newFavorites);
    localStorage.setItem('bus_tracker_favorites', JSON.stringify(newFavorites));
  }, [favorites]);

  // Check if item is favorite
  const isFavorite = useCallback((type: 'route' | 'stop' | 'bus', id: string) => {
    const pluralType = `${type}s` as keyof UserFavorites;
    const favArray = favorites[pluralType];
    return Array.isArray(favArray) && favArray.includes(id);
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback((type: 'route' | 'stop' | 'bus', id: string) => {
    if (isFavorite(type, id)) {
      removeFavorite(type, id);
    } else {
      addFavorite(type, id);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
}