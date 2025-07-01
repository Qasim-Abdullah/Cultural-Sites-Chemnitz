import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { addToFavorites, removeFromFavorites, listFavorites } from '../routes/endpoints/api'; // Adjust path as needed

// Favorites Filter Component (like your category buttons)
export const FavoritesFilter = ({ 
  selectedCategory, 
  onCategoryFilter, 
  favoritesCount = 0 
}) => {
  return (
    <button
      onClick={() => onCategoryFilter('favorites')}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        selectedCategory === 'favorites'
          ? 'bg-pink-100 text-pink-700 border border-pink-200'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
      <Heart className="w-4 h-4" />
      <span className="text-sm">Favorites</span>
      {favoritesCount > 0 && (
        <span className="ml-auto text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
          {favoritesCount}
        </span>
      )}
    </button>
  );
};

// Favorite Button Component (for individual locations)
export const FavoriteButton = ({ 
  location, 
  isFavorite, 
  onToggleFavorite, 
  size = 'sm' 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setLoading(true);
    
    try {
      await onToggleFavorite(location, isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'p-1' : 'p-2';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${buttonSize} rounded-full transition-colors ${
        isFavorite
          ? 'text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100'
          : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <div className={`${iconSize} animate-spin rounded-full border-2 border-pink-600 border-t-transparent`} />
      ) : isFavorite ? (
        <Heart className={`${iconSize} fill-current`} />
      ) : (
        <Heart className={iconSize} />
      )}
    </button>
  );
};

// Main Favorites Hook (for managing favorites state)
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await listFavorites();
      setFavorites(data || []); // Ensure we always set an array
    } catch (err) {
      setError(err.message);
      setFavorites([]); // Set empty array on error
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (location, currentlyFavorite) => {
    try {
      if (currentlyFavorite) {
        await removeFromFavorites(location.id);
        setFavorites(prev => prev.filter(fav => fav.id !== location.id));
      } else {
        await addToFavorites(location.id);
        // Add to favorites list (assuming the location object has the right structure)
        const favoriteItem = {
          id: location.id,
          name: location.name,
          osm_id: location.osm_id || location.id
        };
        setFavorites(prev => [...prev, favoriteItem]);
      }
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so components can handle it
    }
  };

  const isFavorite = (locationId) => {
    return favorites.some(fav => fav.id === locationId);
  };

  const getFavoriteLocations = (allLocations) => {
    return allLocations.filter(location => isFavorite(location.id));
  };

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorite,
    getFavoriteLocations,
    refreshFavorites: loadFavorites
  };
};