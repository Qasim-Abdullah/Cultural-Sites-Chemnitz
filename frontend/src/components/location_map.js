import React, { useState, useEffect } from 'react';
import { fetch_MAP_Locations } from '../routes/endpoints/api';
import { MapPin, Search, Utensils, Building2, Trees, Car, Map, Filter, X } from 'lucide-react';
import LeafletMap from './map';


const LocationMapApp = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wheelchairFilter, setWheelchairFilter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Fetch locations with filters
  const fetchLocations = async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build filters object
      const filters = {};

      const categoryToUse = customFilters.type || selectedCategory;

      if (categoryToUse && categoryToUse !== 'all') {
        if (Array.isArray(categoryToUse)) {
          filters.type__in = categoryToUse.join(','); // e.g., "art,museum"
        } else {
          filters.type = categoryToUse;
        }
      }


      // Add search filter
      const searchToUse = customFilters.search || searchQuery;
      if (searchToUse && searchToUse.trim()) {
        filters.search = searchToUse.trim();
      }

      // Add wheelchair filter
      const wheelchairToUse = customFilters.wheelchair || wheelchairFilter;
      if (wheelchairToUse) {
        filters.wheelchair = wheelchairToUse;
      }

      // Add any additional custom filters
      Object.keys(customFilters).forEach(key => {
        if (!['type', 'search', 'wheelchair'].includes(key)) {
          filters[key] = customFilters[key];
        }
      });

      console.log('Fetching with filters:', filters);
      const data = await fetch_MAP_Locations(filters);

      // Debug log to see the actual data structure
      console.log('API Response:', data);
      console.log('API Response type:', typeof data);
      console.log('API Response keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');

      // Handle GeoJSON FeatureCollection format
      let locationsArray = [];

      if (Array.isArray(data)) {
        locationsArray = data;
        console.log('Data is array, length:', data.length);
      } else if (data && typeof data === 'object') {
        // Check if it's a GeoJSON FeatureCollection
        if (data.type === 'FeatureCollection') {
          console.log('Found GeoJSON FeatureCollection');

          // Handle nested FeatureCollection structure
          let features = data.features;

          // If features is itself a FeatureCollection (nested structure)
          if (features && typeof features === 'object' && features.type === 'FeatureCollection') {
            console.log('Found nested FeatureCollection, extracting inner features');
            features = features.features;
          }

          // Now features should be an array
          if (Array.isArray(features)) {
            console.log('Found features array with', features.length, 'features');

            // Transform GeoJSON features to expected format
            locationsArray = features.map(feature => {
              const props = feature.properties || {};
              const coords = feature.geometry?.coordinates || [];

              return {
                id: feature.id || props.osm_id || props.id || Math.random().toString(36),
                name: props.name || props.osm_id || `Location ${feature.id || 'Unknown'}`,
                amenity: props.amenity || null,
                tourism: props.tourism || null,
                landuse: props.landuse || null,
                geometry: feature.geometry,
                coordinates: coords,
                addr_street: props.addr_street || null,
                addr_city: props.addr_city || null,
                address: props.address || null,
                addr_full: props.addr_full || null,
                wheelchair: props.wheelchair || null,
                website: props.website || null,
                operator: props.operator || null,
                wikidata: props.wikidata || null,
                // Include all original properties
                ...props
              };
            });

            console.log('Transformed locations:', locationsArray);
          } else {
            console.warn('Features is not an array:', features);
            setError('Invalid GeoJSON structure: features is not an array');
            locationsArray = [];
          }
        } else {
          // Try different possible property names for the locations array
          const possibleKeys = ['locations', 'data', 'results', 'items', 'places', 'venues', 'features'];
          let found = false;

          for (const key of possibleKeys) {
            if (Array.isArray(data[key])) {
              locationsArray = data[key];
              found = true;
              console.log(`Found locations in property: ${key}, length: ${data[key].length}`);
              break;
            }
          }

          if (!found) {
            // If it's an object but doesn't contain an array, maybe it's a single location
            if ((data.id || data.name) && (data.geometry || data.coordinates)) {
              locationsArray = [data];
              console.log('Treating single object as array');
            } else {
              console.warn('API returned unexpected data structure. Available keys:', Object.keys(data));
              console.warn('Full data sample:', JSON.stringify(data, null, 2));

              // Show error to user instead of using mock data
              setError('Unexpected data format received from API');
              locationsArray = [];
            }
          }
        }
      } else if (data === null || data === undefined) {
        console.log('API returned null/undefined');
        locationsArray = [];
      } else {
        console.warn('API returned non-object data:', data, 'Type:', typeof data);
        setError('Invalid data format received from API');
        locationsArray = [];
      }

      console.log('Final locations array:', locationsArray);
      console.log('Final locations count:', locationsArray.length);

      setLocations(locationsArray);
      setFilteredLocations(locationsArray);

    } catch (error) {
      console.error('Error fetching locations:', error);
      console.error('Error details:', error.message, error.stack);

      setError(`Failed to fetch locations: ${error.message}`);
      setLocations([]);
      setFilteredLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const categories = [
    { id: 'all', label: 'All Places', icon: Map, color: 'bg-gray-500' },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'bg-red-500' },
    { id: 'artwork', label: 'Artwork', icon: Building2, color: 'bg-blue-500' },
    { id: 'theatre', label: 'Theatre', icon: Trees, color: 'bg-green-500' },
    { id: 'museum', label: 'Museum', icon: Car, color: 'bg-purple-500' }
  ];

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchLocations({ type: categoryId });
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchLocations({ search: searchQuery });
      } else {
        fetchLocations();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle wheelchair filter
  const handleWheelchairFilter = (value) => {
    setWheelchairFilter(value);
    fetchLocations({ wheelchair: value });
  };

  // Initial load
  useEffect(() => {
    fetchLocations();
  }, []);

  // Get marker color based on category
  const getMarkerColor = (location) => {
    if (!location) return 'bg-gray-500';

    if (location.amenity?.toLowerCase().includes('restaurant') ||
      location.amenity?.toLowerCase().includes('cafe') ||
      location.amenity?.toLowerCase().includes('bar')) {
      return 'bg-red-500';
    }

    if (location.tourism?.toLowerCase().includes('museum') ||
      location.tourism?.toLowerCase().includes('attraction') ||
      location.tourism?.toLowerCase().includes('gallery')) {
      return 'bg-blue-500';
    }

    if (location.landuse?.toLowerCase().includes('park') ||
      location.landuse?.toLowerCase().includes('garden')) {
      return 'bg-green-500';
    }

    if (location.amenity?.toLowerCase().includes('parking')) {
      return 'bg-purple-500';
    }

    return 'bg-gray-500';
  };

  // Get wheelchair accessibility display

  const getWheelchairDisplay = (wheelchair) => {
    switch (wheelchair) {
      case 'yes':
        return { text: '♿ Accessible', class: 'bg-green-100 text-green-700' };
      case 'limited':
        return { text: '♿ Limited', class: 'bg-yellow-100 text-yellow-700' };
      case 'no':
        return { text: '♿ Not Accessible', class: 'bg-red-100 text-red-700' };
      default:
        return null;
    }
  };

  // Get location type display
  const getLocationTypeDisplay = (location) => {
    if (!location) return null;

    const type = location.amenity || location.tourism || location.landuse;
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : null;
  };

  // Get location address
  const getLocationAddress = (location) => {
    if (location.addr_street && location.addr_city) {
      return `${location.addr_street}, ${location.addr_city}`;
    } else if (location.address) {
      return location.address;
    } else if (location.addr_full) {
      return location.addr_full;
    } else if (location.geometry && location.geometry.coordinates) {
      // Show coordinates as fallback
      const coords = location.geometry.coordinates;
      return `Lat: ${coords[1]?.toFixed(4)}, Lng: ${coords[0]?.toFixed(4)}`;
    } else {
      return 'Address not available';
    }
  };

  // Ensure filteredLocations is always an array
  const safeFilteredLocations = Array.isArray(filteredLocations) ? filteredLocations : [];

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-blue-600" />
            Location Explorer
          </h1>
          <p className="text-gray-600 mt-1">Discover places around you</p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters 
       <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <X className="w-3 h-3" /> : null}
          </button>

          {showFilters && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Wheelchair Accessibility
                </label>
                <select
                  value={wheelchairFilter}
                  onChange={(e) => handleWheelchairFilter(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="yes">Accessible</option>
                  <option value="limited">Limited Access</option>
                  <option value="no">Not Accessible</option>
                </select>
              </div>
            </div>
          )}
        </div>*/}


         {/*Results List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Results {/* ({safeFilteredLocations.length}) */}
            </h3>
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>



          

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => fetchLocations()}
                className="text-red-600 text-xs underline mt-1"
              >
                Try again
              </button>
            </div>
          )}

          <div className="space-y-2">
            {safeFilteredLocations.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <Map className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>{error ? 'Failed to load locations' : 'No locations found'}</p>
                <p className="text-sm">
                  {error ? 'Check your connection and try again' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              safeFilteredLocations.map((location) => {
                const wheelchairDisplay = getWheelchairDisplay(location.wheelchair);
                const typeDisplay = getLocationTypeDisplay(location);
                const address = getLocationAddress(location);

                return (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedLocation?.id === location.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getMarkerColor(location)}`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {location.name || 'Unnamed Location'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {address}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {wheelchairDisplay && (
                            <span className={`text-xs px-2 py-0.5 rounded ${wheelchairDisplay.class}`}>
                              {wheelchairDisplay.text}
                            </span>
                          )}
                          {typeDisplay && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {typeDisplay}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>


      {/* Map Area */}
      <LeafletMap
        safeFilteredLocations={filteredLocations}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        getWheelchairDisplay={getWheelchairDisplay}
        getLocationTypeDisplay={getLocationTypeDisplay}
        getLocationAddress={getLocationAddress}
      />
    </div>
  );
};

export default LocationMapApp;