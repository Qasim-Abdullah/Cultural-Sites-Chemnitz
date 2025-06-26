// components/LeafletMap.js
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon paths ONCE using useEffect
const setupLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

const LeafletMap = ({
  safeFilteredLocations = [],
  selectedLocation,
  setSelectedLocation,
  getWheelchairDisplay,
  getLocationTypeDisplay,
  getLocationAddress,
}) => {
  useEffect(() => {
    setupLeafletIcons();
  }, []);

  // Enhanced debugging with complete data structure inspection
  useEffect(() => {
    console.log('=== ENHANCED DEBUGGING LOCATION DATA ===');
    console.log('Total locations:', safeFilteredLocations.length);
    
    if (safeFilteredLocations.length > 0) {
      console.log('First location complete structure:', JSON.stringify(safeFilteredLocations[0], null, 2));
      
      // Check the first few locations more thoroughly
      safeFilteredLocations.slice(0, 5).forEach((loc, index) => {
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
          'loc.position': loc.position,
          'loc.coord': loc.coord,
          'loc.latlng': loc.latlng,
          'loc.latLng': loc.latLng,
          'loc.point': loc.point,
          'loc.gps': loc.gps,
          'loc.address?.coordinates': loc.address?.coordinates,
          'loc.properties': loc.properties,
          'loc.properties?.coordinates': loc.properties?.coordinates,
        };
        
        Object.entries(coordChecks).forEach(([key, value]) => {
          if (value !== undefined) {
            console.log(`  ${key}:`, value);
          }
        });
      });
    }
  }, [safeFilteredLocations]);

  // Much more comprehensive coordinate extraction function
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
        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
          const [lng, lat] = location.coordinates;
          return validateAndFormat(lat, lng);
        }
        return null;
      },
      
      // GeoJSON coordinates [lat, lng] - already in correct order
      () => {
        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
          const [lat, lng] = location.coordinates;
          return validateAndFormat(lat, lng);
        }
        return null;
      },
      
      // GeoJSON in geometry object
      () => {
        if (location.geometry?.coordinates && Array.isArray(location.geometry.coordinates) && location.geometry.coordinates.length === 2) {
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
      
      // Position object
      () => {
        if (location.position) {
          if (location.position.lat !== undefined && location.position.lng !== undefined) {
            return validateAndFormat(location.position.lat, location.position.lng);
          }
          if (location.position.latitude !== undefined && location.position.longitude !== undefined) {
            return validateAndFormat(location.position.latitude, location.position.longitude);
          }
        }
        return null;
      },
      
      // String coordinates that need parsing
      () => {
        if (typeof location.coordinates === 'string') {
          try {
            const parsed = JSON.parse(location.coordinates);
            if (Array.isArray(parsed) && parsed.length === 2) {
              const [lng, lat] = parsed;
              return validateAndFormat(lat, lng);
            }
          } catch (e) {
            // Try comma-separated string
            const parts = location.coordinates.split(',').map(s => s.trim());
            if (parts.length === 2) {
              return validateAndFormat(parts[0], parts[1]);
            }
          }
        }
        return null;
      },
      
      // Address coordinates
      () => {
        if (location.address?.coordinates) {
          if (Array.isArray(location.address.coordinates) && location.address.coordinates.length === 2) {
            const [lng, lat] = location.address.coordinates;
            return validateAndFormat(lat, lng);
          }
        }
        return null;
      }
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
    
    if (!safeFilteredLocations.length) {
      console.log('No locations, using London default');
      return [51.505, -0.09]; // London default
    }
    
    const validCoordinates = safeFilteredLocations
      .map(getCoordinates)
      .filter(coords => coords !== null);
    
    console.log('Valid coordinates found:', validCoordinates.length, 'out of', safeFilteredLocations.length);
    
    if (validCoordinates.length === 0) {
      console.log('No valid coordinates found, using London default');
      return [51.505, -0.09];
    }
    
    const avgLat = validCoordinates.reduce((sum, [lat]) => sum + lat, 0) / validCoordinates.length;
    const avgLng = validCoordinates.reduce((sum, [, lng]) => sum + lng, 0) / validCoordinates.length;
    
    console.log('Calculated center:', [avgLat, avgLng]);
    return [avgLat, avgLng];
  }, [safeFilteredLocations]);

  // Create markers with enhanced debugging
  const markers = useMemo(() => {
    console.log('Creating markers...');
    let validMarkersCount = 0;
    let invalidMarkersCount = 0;
    
    const markerElements = safeFilteredLocations.map((location) => {
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
            click: () => {
              console.log('Marker clicked:', location.name);
              setSelectedLocation(location);
            },
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
            </div>
          </Popup>
        </Marker>
      );
    }).filter(marker => marker !== null);
    
    console.log(`Markers created: ${validMarkersCount} valid, ${invalidMarkersCount} invalid`);
    return markerElements;
  }, [safeFilteredLocations, getWheelchairDisplay, getLocationTypeDisplay, getLocationAddress, setSelectedLocation]);

  return (
    <div className="flex-1 relative z-0">
      {/* Enhanced debug info overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white bg-opacity-95 p-3 rounded shadow text-xs max-w-xs">
        <div className="font-semibold mb-1">Debug Info:</div>
        <div>Total locations: {safeFilteredLocations.length}</div>
        <div>Valid markers: {markers.length}</div>
        <div>Invalid markers: {safeFilteredLocations.length - markers.length}</div>
        <div>Center: [{defaultCenter[0].toFixed(4)}, {defaultCenter[1].toFixed(4)}]</div>
        {safeFilteredLocations.length > 0 && markers.length === 0 && (
          <div className="text-red-600 mt-2 font-semibold">
            No markers displayed! Check console for coordinate format.
          </div>
        )}
      </div>
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultCenter[0] === 51.505 ? 10 : 13} // Zoom out if using default center
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;