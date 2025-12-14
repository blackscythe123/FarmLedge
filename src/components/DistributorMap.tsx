import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Loader2, Info } from "lucide-react";

// Fix Leaflet default marker icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CropInfo {
  name: string;
  district: string;
  dominant_crop: string;
  harvest_window: string;
  soil_grade: string;
  avg_yield_qt_acre: number;
  secondary_crops: string[];
}

interface FarmerData {
  id: number;
  district: string;
  block_code: string;
  farmer_name: string;
  contact: string;
  crop_sown: string;
  quantity_quintals: number;
  lat: number;
  lng: number;
}

interface MapState {
  distributorLocation: { lat: number; lng: number } | null;
  activeRouteLine: any;
  activeLocalityLayer: any;
  cropLookup: Record<string, CropInfo>;
}

// Helper function to format travel time intelligently
const formatTravelTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(minutes / 1440); // 1440 minutes in a day
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
  }
  if (mins > 0) {
    parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
  }
  
  return parts.join(' ');
};

const DistributorMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [showFarmers, setShowFarmers] = useState(false); // Toggle between layers
  
  // Use refs for mutable state that doesn't need re-renders
  const distributorLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const activeRouteLineRef = useRef<any>(null);
  const cropLookupRef = useRef<Record<string, CropInfo>>({});
  const lulcLayerRef = useRef<any>(null); // LULC polygon layer
  const farmerLayerRef = useRef<any>(null); // Farmer marker layer

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([20.46, 85.88], 8);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        distributorLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // Add draggable marker for distributor location
        const marker = L.marker([pos.coords.latitude, pos.coords.longitude], { draggable: true })
          .bindPopup("<b>Your Location</b><br>Drag to refine")
          .addTo(map);

        marker.on('dragend', (e: any) => {
          const newPos = e.target.getLatLng();
          distributorLocationRef.current = { lat: newPos.lat, lng: newPos.lng };
          console.log('Location updated:', distributorLocationRef.current);
        });

        map.setView([pos.coords.latitude, pos.coords.longitude], 10);
        setLocationStatus('Location detected ✓');
        console.log('Initial location set:', distributorLocationRef.current);
      },
      (error) => {
        console.error('Geolocation error:', error);
        distributorLocationRef.current = { lat: 20.46, lng: 85.88 };
        setLocationStatus('Using default location (Odisha center)');
        
        // Add marker at default location
        L.marker([20.46, 85.88], { draggable: true })
          .bindPopup("<b>Default Location</b><br>Odisha, India<br>Drag to set your location")
          .on('dragend', (e: any) => {
            const newPos = e.target.getLatLng();
            distributorLocationRef.current = { lat: newPos.lat, lng: newPos.lng };
            setLocationStatus('Location set manually ✓');
            console.log('Manual location set:', distributorLocationRef.current);
          })
          .addTo(map);
        
        console.log('Default location set:', distributorLocationRef.current);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Load GeoJSON and crop data
    Promise.all([
      fetch(`${window.location.origin}/data/odisha_cropland.geojson`).then(res => {
        if (!res.ok) throw new Error(`Failed to load GeoJSON: ${res.status}`);
        return res.json();
      }),
      fetch(`${window.location.origin}/data/crop_lookup.json`).then(res => {
        if (!res.ok) throw new Error(`Failed to load crop data: ${res.status}`);
        return res.json();
      })
    ]).then(([geoJsonData, cropLookup]) => {
      cropLookupRef.current = cropLookup;

      // Add GeoJSON layer
      L.geoJSON(geoJsonData, {
        style: (feature) => {
          const code = feature?.properties?.BlockCode;
          const info: Partial<CropInfo> = cropLookupRef.current[code] || {};
          const color = info.soil_grade === 'A' ? '#38761d' : 
                       info.soil_grade === 'B' ? '#6aa84f' : '#8fbc8f';
          return { 
            color: '#2d5016', 
            weight: 2, 
            fillColor: color, 
            fillOpacity: 0.5 
          };
        },
        onEachFeature: (feature, layer: any) => {
          const code = feature.properties.BlockCode;
          const info: Partial<CropInfo> = cropLookupRef.current[code] || {};

          // Calculate centroid for routing
          layer.options.centroid = layer.getBounds().getCenter();
          layer.options.localityCode = code;

          // Create popup content with button
          const createPopupContent = (showRoute = false, routeInfo?: any) => {
            if (showRoute && routeInfo) {
              return `
                <div class="p-2">
                  <h3 class="font-bold text-lg">${info.name || 'Unknown'}</h3>
                  <p class="text-sm"><strong>Dominant Crop:</strong> ${info.dominant_crop || 'N/A'}</p>
                  <hr class="my-2"/>
                  <p class="text-sm font-bold">🚗 Distance: ${routeInfo.distance} km</p>
                  <p class="text-sm font-bold">⏱️ Travel Time: ${routeInfo.time}</p>
                </div>
              `;
            }
            return `
              <div class="p-2">
                <h3 class="font-bold text-lg">${info.name || 'Unknown'}</h3>
                <p class="text-sm"><strong>District:</strong> ${info.district || 'N/A'}</p>
                <p class="text-sm"><strong>Dominant Crop:</strong> ${info.dominant_crop || 'N/A'}</p>
                <p class="text-sm"><strong>Harvest:</strong> ${info.harvest_window || 'N/A'}</p>
                <p class="text-sm"><strong>Soil Grade:</strong> ${info.soil_grade || 'N/A'}</p>
                <p class="text-sm"><strong>Avg Yield:</strong> ${info.avg_yield_qt_acre || 'N/A'} qt/acre</p>
                <button 
                  id="route-btn-${code}" 
                  class="mt-2 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                >
                  Calculate Route
                </button>
              </div>
            `;
          };

          layer.bindPopup(createPopupContent());

          // Add click handler for the layer
          layer.on('click', () => {
            layer.setStyle({ weight: 4, color: '#0000ff' });
          });

          // Add popup open event to attach button listener
          layer.on('popupopen', () => {
            const button = document.getElementById(`route-btn-${code}`);
            if (button) {
              button.onclick = async () => {
                console.log('Calculate route clicked for:', code);
                console.log('Current location:', distributorLocationRef.current);

                if (!distributorLocationRef.current) {
                  alert('Location not available. Please wait for location detection or drag the marker to set your location.');
                  return;
                }

                // Clear previous route
                if (activeRouteLineRef.current) {
                  map.removeLayer(activeRouteLineRef.current);
                  activeRouteLineRef.current = null;
                }

                const start = distributorLocationRef.current;
                const end = layer.options.centroid;

                console.log('Route from:', start, 'to:', end);

                try {
                  // Update popup to show loading
                  layer.setPopupContent('<div class="p-2"><p class="text-sm">Calculating route... ⏳</p></div>');

                  const response = await fetch('http://localhost:3001/api/get-route', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      start: [start.lng, start.lat],
                      end: [end.lng, end.lat]
                    })
                  });

                  const data = await response.json();
                  console.log('Route response:', data);

                  if (data.error) {
                    throw new Error(data.error);
                  }

                  if (!data.routes || data.routes.length === 0) {
                    throw new Error('No route found');
                  }

                  const route = data.routes[0];
                  
                  console.log('Route data:', route);
                  console.log('Route geometry:', route.geometry);
                  
                  if (!route.summary) {
                    throw new Error('Invalid route data');
                  }
                  
                  const distance_km = (route.summary.distance / 1000).toFixed(1);
                  const travel_time_min = Math.round(route.summary.duration / 60);
                  const formatted_time = formatTravelTime(travel_time_min);

                  // Get coordinates from geometry
                  let coordinates: [number, number][] = [];
                  
                  if (route.geometry && route.geometry.coordinates && Array.isArray(route.geometry.coordinates)) {
                    console.log('Geometry coordinates count:', route.geometry.coordinates.length);
                    console.log('First few coordinates:', route.geometry.coordinates.slice(0, 3));
                    
                    // GeoJSON format: coordinates are [lng, lat], need to swap to [lat, lng] for Leaflet
                    coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                    console.log('✅ Using actual road route with', coordinates.length, 'points');
                  } else {
                    // Fallback to direct line
                    coordinates = [[start.lat, start.lng], [end.lat, end.lng]];
                    console.warn('⚠️ Using direct line - no geometry coordinates available');
                    console.warn('Route structure:', Object.keys(route));
                  }

                  activeRouteLineRef.current = L.polyline(coordinates, { color: '#cc0000', weight: 5 }).addTo(map);

                  // Fit bounds to show entire route
                  map.fitBounds(activeRouteLineRef.current.getBounds(), { padding: [50, 50] });

                  // Update popup with route info
                  layer.setPopupContent(createPopupContent(true, {
                    distance: distance_km,
                    time: formatted_time
                  }));

                } catch (error: any) {
                  console.error('Route calculation error:', error);
                  layer.setPopupContent(`
                    <div class="p-2">
                      <h3 class="font-bold text-lg">${info.name || 'Unknown'}</h3>
                      <p class="text-sm text-red-600">Route calculation failed: ${error.message}</p>
                      <button 
                        id="route-btn-${code}" 
                        class="mt-2 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  `);
                  // Re-attach listener after error
                  setTimeout(() => {
                    const retryBtn = document.getElementById(`route-btn-${code}`);
                    if (retryBtn) retryBtn.onclick = button.onclick;
                  }, 100);
                }
              };
            }
          });
        }
      }).addTo(map);

      // Store LULC layer reference
      lulcLayerRef.current = map._layers[Object.keys(map._layers)[Object.keys(map._layers).length - 1]];

      // Load farmer data and create farmer layer
      fetch(`${window.location.origin}/data/farmer_data_simulated.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load farmer data: ${res.status}`);
          return res.json();
        })
        .then((farmers: FarmerData[]) => {
          // Create farmer layer group
          farmerLayerRef.current = L.layerGroup();

          farmers.forEach(farmer => {
            // Create custom icon for farmer
            const farmerIcon = L.divIcon({
              className: 'farmer-marker',
              html: `<div style="background: #ff6b35; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">🌾</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });

            const marker = L.marker([farmer.lat, farmer.lng], { icon: farmerIcon });

            // Create popup content function
            const createFarmerPopup = (showRoute = false, routeInfo?: any) => {
              if (showRoute && routeInfo) {
                return `
                  <div class="p-2" style="min-width: 200px;">
                    <h3 class="font-bold text-lg">${farmer.farmer_name}</h3>
                    <p class="text-sm"><strong>Crop:</strong> ${farmer.crop_sown} (${farmer.quantity_quintals} Qtl)</p>
                    <hr class="my-2"/>
                    <p class="text-sm font-bold">🚗 Distance: ${routeInfo.distance} km</p>
                    <p class="text-sm font-bold">⏱️ Travel Time: ${routeInfo.time}</p>
                    <p class="text-sm font-bold mt-2">📞 ${farmer.contact}</p>
                  </div>
                `;
              }
              return `
                <div class="p-2" style="min-width: 200px;">
                  <h3 class="font-bold text-lg">${farmer.farmer_name}</h3>
                  <p class="text-sm"><strong>District:</strong> ${farmer.district}</p>
                  <p class="text-sm"><strong>Crop:</strong> ${farmer.crop_sown} (${farmer.quantity_quintals} Qtl)</p>
                  <p class="text-sm"><strong>Contact:</strong> ${farmer.contact}</p>
                  <hr class="my-2"/>
                  <button 
                    id="farmer-route-btn-${farmer.id}" 
                    class="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    📍 Calculate Route
                  </button>
                </div>
              `;
            };

            marker.bindPopup(createFarmerPopup());

            // Add popup open event to attach button listener
            marker.on('popupopen', () => {
              const button = document.getElementById(`farmer-route-btn-${farmer.id}`);
              if (button) {
                button.onclick = async () => {
                  if (!distributorLocationRef.current) {
                    alert('Location not available. Please wait for location detection.');
                    return;
                  }

                  // Clear previous route
                  if (activeRouteLineRef.current) {
                    map.removeLayer(activeRouteLineRef.current);
                    activeRouteLineRef.current = null;
                  }

                  const start = distributorLocationRef.current;
                  const end = { lat: farmer.lat, lng: farmer.lng };

                  try {
                    marker.setPopupContent('<div class="p-2"><p class="text-sm">Calculating route... ⏳</p></div>');

                    const response = await fetch('http://localhost:3001/api/get-route', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        start: [start.lng, start.lat],
                        end: [end.lng, end.lat]
                      })
                    });

                    const data = await response.json();

                    if (data.error || !data.routes || data.routes.length === 0) {
                      throw new Error(data.error || 'No route found');
                    }

                    const route = data.routes[0];
                    const distance_km = (route.summary.distance / 1000).toFixed(1);
                    const travel_time_min = Math.round(route.summary.duration / 60);
                    const formatted_time = formatTravelTime(travel_time_min);

                    // Get coordinates from geometry
                    let coordinates: [number, number][] = [];
                    
                    if (route.geometry && route.geometry.coordinates && Array.isArray(route.geometry.coordinates)) {
                      coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                    } else {
                      coordinates = [[start.lat, start.lng], [end.lat, end.lng]];
                    }

                    activeRouteLineRef.current = L.polyline(coordinates, { color: '#0066cc', weight: 5 }).addTo(map);
                    map.fitBounds(activeRouteLineRef.current.getBounds(), { padding: [50, 50] });

                    // Update popup with route info
                    marker.setPopupContent(createFarmerPopup(true, {
                      distance: distance_km,
                      time: formatted_time
                    }));

                  } catch (error: any) {
                    console.error('Route calculation error:', error);
                    marker.setPopupContent(createFarmerPopup() + '<p class="text-sm text-red-600 mt-2">Route calculation failed</p>');
                  }
                };
              }
            });

            farmerLayerRef.current.addLayer(marker);
          });

          console.log('✅ Loaded', farmers.length, 'farmer markers');
        })
        .catch(err => console.error('Farmer data loading error:', err));

      setLoading(false);
    }).catch(err => {
      console.error('Data loading error:', err);
      setError('Failed to load cropland data');
      setLoading(false);
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const clearRoute = () => {
    if (mapRef.current && activeRouteLineRef.current) {
      mapRef.current.removeLayer(activeRouteLineRef.current);
      activeRouteLineRef.current = null;
      mapRef.current.setView([20.46, 85.88], 8);
    }
  };

  const toggleLayer = (showFarmerLayer: boolean) => {
    if (!mapRef.current) return;

    setShowFarmers(showFarmerLayer);

    if (showFarmerLayer) {
      // Show farmer layer, hide LULC layer
      if (lulcLayerRef.current) {
        mapRef.current.removeLayer(lulcLayerRef.current);
      }
      if (farmerLayerRef.current) {
        farmerLayerRef.current.addTo(mapRef.current);
      }
    } else {
      // Show LULC layer, hide farmer layer
      if (farmerLayerRef.current) {
        mapRef.current.removeLayer(farmerLayerRef.current);
      }
      if (lulcLayerRef.current) {
        lulcLayerRef.current.addTo(mapRef.current);
      }
    }

    // Clear any active route when switching layers
    clearRoute();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          Collection Route Planner
        </CardTitle>
        <CardDescription>
          Interactive map showing agricultural cropland areas and individual farmers in Odisha. Toggle between crop regions and farmer contacts, then calculate driving routes to plan your collection logistics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Navigation className="w-4 h-4" />
            <span>{locationStatus}</span>
          </div>
          <Button onClick={clearRoute} variant="outline" size="sm">
            Clear Route
          </Button>
        </div>

        {/* Layer Toggle Buttons */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
          <Info className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">View:</span>
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={() => toggleLayer(false)}
              variant={!showFarmers ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              🗺️ Crop Regions
            </Button>
            <Button
              onClick={() => toggleLayer(true)}
              variant={showFarmers ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              🌾 Individual Farmers
            </Button>
          </div>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span>Loading map data...</span>
              </div>
            </div>
          )}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[600px] rounded-lg border-2 border-slate-200"
            style={{ zIndex: 0 }}
          />
        </div>

        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>How to use:</strong> Click on any colored region to view crop information. 
            Use the "Calculate Route" button to get driving directions and distance from your location.
            Soil grades: A (Best), B (Good), C (Fair).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DistributorMap;
