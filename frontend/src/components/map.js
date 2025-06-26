// components/LeafletMap.js
import React, { useEffect, useMemo, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon paths ONCE
const setupLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

// Custom hook to fit map bounds when route changes
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  
  return null;
};

const LeafletMap = forwardRef(({
  safeFilteredLocations = [],
  selectedLocation,
  setSelectedLocation,
  showingRoute,
  setShowingRoute,
  getWheelchairDisplay,
  getLocationTypeDisplay,
  getLocationAddress,
}, ref) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    showRouteToLocation: (location) => {
      console.log('showRouteToLocation called from parent for:', location.name);
      if (userLocation) {
        const destinationCoords = getCoordinates(location);
        if (destinationCoords) {
          fetchRoute(userLocation, destinationCoords);
        } else {
          console.error('Could not get coordinates for location:', location);
        }
      } else {
        console.error('User location not available');
      }
    },
    clearRoute: () => {
      console.log('clearRoute called from parent');
      clearRoute();
    }
  }));

  useEffect(() => {
    setupLeafletIcons();
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log('User location obtained:', [latitude, longitude]);
        },
        (error) => {
          console.warn('Could not get user location:', error.message);
          // Use Chemnitz as fallback
          setUserLocation([50.8278, 12.9214]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation not supported, using Chemnitz as fallback');
      setUserLocation([50.8278, 12.9214]);
    }
  }, []);

  // Function to fetch route from OSRM
  const fetchRoute = async (start, end) => {
    console.log('Fetching route from', start, 'to', end);
    setIsLoadingRoute(true);
    setRouteError(null);
    
    try {
      // Using OSRM (free routing service)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
        setShowingRoute(true);
        console.log('Route fetched successfully:', coordinates.length, 'points');
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteError(error.message);
      // Fallback: draw straight line
      setRouteCoordinates([start, end]);
      setShowingRoute(true);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Clear route function
  const clearRoute = useCallback(() => {
    console.log('Clearing route');
    setRouteCoordinates([]);
    setRouteError(null);
    setShowingRoute(false);
    setSelectedLocation(null);
  }, [setShowingRoute, setSelectedLocation]);

  // Enhanced debugging with complete data structure inspection
  useEffect(() => {
    console.log('=== ENHANCED DEBUGGING LOCATION DATA ===');
    console.log('Total locations:', safeFilteredLocations.length);
    
    if (safeFilteredLocations.length > 0) {
      console.log('First location complete structure:', JSON.stringify(safeFilteredLocations[0], null, 2));
      
      // Check the first few locations more thoroughly
      safeFilteredLocations.slice(0, 3).forEach((loc, index) => {
        console.log(`\n--- Location ${index + 1} Analysis ---`);
        console.log('Full object:', loc);
        console.log('All keys:', Object.keys(loc));
        
        // Check all possible coordinate locations
        const coordChecks = {
          'loc.coordinates': loc.coordinates,
          'loc.lat': loc.lat,
          'loc.lng': loc.lng,
          'loc.latitude': loc.latitude,
          'loc.longitude': loc.longitude,
          'loc.geometry': loc.geometry,
          'loc.geometry?.coordinates': loc.geometry?.coordinates,
          'loc.location': loc.location,
        };
        
        Object.entries(coordChecks).forEach(([key, value]) => {
          if (value !== undefined) {
            console.log(`  ${key}:`, value);
          }
        });
      });
    }
  }, [safeFilteredLocations]);

  // Comprehensive coordinate extraction function
  const getCoordinates = (location) => {
    if (!location) return null;
    
    console.log('Extracting coordinates for:', location.name || location.id);
    
    // Helper function to validate and format coordinates
    const validateAndFormat = (lat, lng) => {
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      
      if (isNaN(numLat) || isNaN(numLng)) return null;
      if (numLat < -90 || numLat > 90) return null;
      if (numLng < -180 || numLng > 180) return null;
      
      return [numLat, numLng];
    };
    
    // Try all possible coordinate formats
    const coordinateAttempts = [
      // GeoJSON coordinates [lng, lat] - swap to [lat, lng]
      () => {
        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
          const [lng, lat] = location.coordinates;
          return validateAndFormat(lat, lng);
        }
        return null;
      },
      
      // GeoJSON in geometry object
      () => {
        if (location.geometry?.coordinates && Array.isArray(location.geometry.coordinates) && location.geometry.coordinates.length >= 2) {
          const [lng, lat] = location.geometry.coordinates;
          return validateAndFormat(lat, lng);
        }
        return null;
      },
      
      // Direct lat/lng properties
      () => {
        if (location.lat !== undefined && location.lng !== undefined) {
          return validateAndFormat(location.lat, location.lng);
        }
        return null;
      },
      
      // latitude/longitude properties
      () => {
        if (location.latitude !== undefined && location.longitude !== undefined) {
          return validateAndFormat(location.latitude, location.longitude);
        }
        return null;
      },
      
      // Nested in location object
      () => {
        if (location.location) {
          if (location.location.lat !== undefined && location.location.lng !== undefined) {
            return validateAndFormat(location.location.lat, location.location.lng);
          }
          if (location.location.latitude !== undefined && location.location.longitude !== undefined) {
            return validateAndFormat(location.location.latitude, location.location.longitude);
          }
        }
        return null;
      },
      
      // Properties object
      () => {
        if (location.properties) {
          if (location.properties.lat !== undefined && location.properties.lng !== undefined) {
            return validateAndFormat(location.properties.lat, location.properties.lng);
          }
          if (location.properties.latitude !== undefined && location.properties.longitude !== undefined) {
            return validateAndFormat(location.properties.latitude, location.properties.longitude);
          }
          if (location.properties.coordinates && Array.isArray(location.properties.coordinates)) {
            const [lng, lat] = location.properties.coordinates;
            return validateAndFormat(lat, lng);
          }
        }
        return null;
      },
    ];
    
    // Try each method until one succeeds
    for (const attempt of coordinateAttempts) {
      const result = attempt();
      if (result) {
        console.log('Coordinates found:', result);
        return result;
      }
    }
    
    console.warn('No valid coordinates found for location:', location.name || location.id);
    return null;
  };

  // Calculate default center dynamically from location data
  const defaultCenter = useMemo(() => {
    console.log('Calculating default center...');
    
    if (userLocation) {
      console.log('No locations, using Chemnitz default');
      return userLocation; // Chemnitz default
    }
    
    const validCoordinates = safeFilteredLocations
      .map(getCoordinates)
      .filter(coords => coords !== null);
    
    console.log('Valid coordinates found:', validCoordinates.length, 'out of', safeFilteredLocations.length);
    
    if (validCoordinates.length === 0) {
      console.log('No valid coordinates found, using Chemnitz default');
      return [50.8278, 12.9214];
    }
    
    const avgLat = validCoordinates.reduce((sum, [lat]) => sum + lat, 0) / validCoordinates.length;
    const avgLng = validCoordinates.reduce((sum, [, lng]) => sum + lng, 0) / validCoordinates.length;
    
    console.log('Calculated center:', [avgLat, avgLng]);
    return [avgLat, avgLng];
  }, [safeFilteredLocations]);

  // Handle marker click with route calculation - only when not showing route
  const handleMarkerClick = (location) => {
    console.log('Marker clicked:', location.name);
    if (!showingRoute) {
      setSelectedLocation(location);
      if (userLocation) {
        const destinationCoords = getCoordinates(location);
        if (destinationCoords) {
          fetchRoute(userLocation, destinationCoords);
        }
      }
    }
  };

  // Create markers with enhanced debugging
  const markers = useMemo(() => {
    console.log('Creating markers...');
    let validMarkersCount = 0;
    let invalidMarkersCount = 0;
    
    // Show all locations unless we're in route mode and have a selected location
    const locationsToShow = showingRoute && selectedLocation 
      ? [selectedLocation] 
      : safeFilteredLocations;
    
    const markerElements = locationsToShow.map((location) => {
      const position = getCoordinates(location);
      
      if (!position) {
        console.warn('Invalid coordinates for location:', location.id, location.name);
        invalidMarkersCount++;
        return null;
      }
      
      validMarkersCount++;
      console.log(`Valid marker ${validMarkersCount}:`, location.name, 'at', position);
      
      return (
        <Marker
          key={location.id || `marker-${validMarkersCount}`}
          position={position}
          eventHandlers={{
            click: () => handleMarkerClick(location),
          }}
        >
          <Popup>
            <div>
              <h4 className="font-medium text-gray-800">{location.name || 'Unnamed Location'}</h4>
              <p className="text-sm text-gray-600">{getLocationAddress(location)}</p>
              <p className="text-xs text-gray-500">Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
              <div className="mt-2">
                {(() => {
                  const wheelchairDisplay = getWheelchairDisplay(location.wheelchair);
                  const typeDisplay = getLocationTypeDisplay(location);
                  return (
                    <>
                      {wheelchairDisplay && (
                        <span className={`text-xs px-2 py-0.5 rounded ${wheelchairDisplay.class}`}>
                          {wheelchairDisplay.text}
                        </span>
                      )}
                      {typeDisplay && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded ml-2">
                          {typeDisplay}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="mt-2 flex gap-2">
                {userLocation && !showingRoute && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(location);
                      const destinationCoords = getCoordinates(location);
                      if (destinationCoords) {
                        fetchRoute(userLocation, destinationCoords);
                      }
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    disabled={isLoadingRoute}
                  >
                    {isLoadingRoute ? 'Loading...' : 'Show Route'}
                  </button>
                )}
                {showingRoute && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRoute();
                    }}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Clear Route
                  </button>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }).filter(marker => marker !== null);
    
    console.log(`Markers created: ${validMarkersCount} valid, ${invalidMarkersCount} invalid`);
    return markerElements;
  }, [safeFilteredLocations, showingRoute, selectedLocation, getWheelchairDisplay, getLocationTypeDisplay, getLocationAddress, userLocation, isLoadingRoute]);

  // Calculate bounds for fitting the map when route is shown
  const mapBounds = useMemo(() => {
    if (routeCoordinates.length > 0) {
      return routeCoordinates;
    }
    return null;
  }, [routeCoordinates]);

  return (
    <div className="flex-1 relative z-0">
      {/* Enhanced debug info overlay */}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultCenter[0] === 50.8278 && defaultCenter[1] === 12.9214 ? 14 : 18}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: '<div style="background-color: #dc2626; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div>
                <h4 className="font-medium text-blue-600">Your Location</h4>
                <p className="text-xs text-gray-500">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Location markers */}
        {markers}
        
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#3b82f6"
            weight={6}
            opacity={1}
            dashArray={null}
          />
        )}
        
        {/* Fit bounds when route changes */}
        <FitBounds bounds={mapBounds} />
      </MapContainer>
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;