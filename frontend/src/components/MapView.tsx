import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  latitude: number;
  longitude: number;
  type?: string;
  bedrooms?: number;
}

interface DisplayModeProps {
  mode: 'display';
  properties: MapProperty[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: MapProperty) => void;
  className?: string;
}

interface PickerModeProps {
  mode: 'picker';
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

interface StaticModeProps {
  mode: 'static';
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
}

type MapViewProps = DisplayModeProps | PickerModeProps | StaticModeProps;

// Helper to dynamic load Mappls SDK script
const loadMapplsScript = (apiKey: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).mappls) {
      resolve((window as any).mappls);
      return;
    }
    const scriptId = 'mappls-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?v=3.0&layer=vector`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => {
          if ((window as any).mappls) {
            resolve((window as any).mappls);
          } else {
            reject(new Error('Mappls failed to initialize globally'));
          }
        }, 300);
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).mappls) {
          clearInterval(checkInterval);
          resolve((window as any).mappls);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!(window as any).mappls) reject(new Error('Mappls load timeout'));
      }, 5000);
    }
  });
};

// Component to handle flying/moving in Leaflet Map
const LeafletMapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
  }, [center[0], center[1], zoom, map]);
  return null;
};

// Component to handle click listener in Leaflet picker mode
const LeafletMapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvent('click', (e) => {
    onClick(e.latlng.lat, e.latlng.lng);
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = (props) => {
  const [useMappls, setUseMappls] = useState<boolean>(false);
  const [mapplsLoaded, setMapplsLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const mapplsContainerRef = useRef<HTMLDivElement>(null);
  const mapplsInstanceRef = useRef<any>(null);
  const mapplsMarkersRef = useRef<any[]>([]);

  const apiKey = import.meta.env.VITE_MAPPLS_API_KEY;

  // Determine if Mappls key is valid and configured
  const isMapplsKeyValid = apiKey && apiKey !== 'YOUR_MAPPLS_API_KEY' && apiKey.trim() !== '';

  useEffect(() => {
    if (isMapplsKeyValid) {
      setUseMappls(true);
      loadMapplsScript(apiKey)
        .then(() => {
          setMapplsLoaded(true);
        })
        .catch((err) => {
          console.warn('Mappls SDK failed to load. Falling back to Leaflet.', err);
          setUseMappls(false);
          setMapError('Mappls failed to load. Using Leaflet fallback.');
        });
    } else {
      setUseMappls(false);
    }
  }, [apiKey, isMapplsKeyValid]);

  // Leaflet Helpers
  const getLeafletInitialState = () => {
    let center: [number, number] = [20.5937, 78.9629]; // Center of India [lat, lng]
    let zoom = 5;

    if (props.mode === 'static') {
      center = [props.latitude, props.longitude];
      zoom = 15;
    } else if (props.mode === 'picker') {
      if (props.selectedLocation) {
        center = [props.selectedLocation.lat, props.selectedLocation.lng];
        zoom = 14;
      }
    } else if (props.mode === 'display') {
      const validProps = props.properties.filter((p) => p.latitude && p.longitude);
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((s, p) => s + p.latitude, 0) / validProps.length;
        const avgLng = validProps.reduce((s, p) => s + p.longitude, 0) / validProps.length;
        center = [avgLat, avgLng];
        zoom = validProps.length === 1 ? 13 : 8;
      }
    }
    return { center, zoom };
  };

  const createLeafletPriceIcon = (price: number, isSelected: boolean) => {
    const priceText = price >= 10000000 
      ? `${(price / 10000000).toFixed(1)} Cr` 
      : price >= 100000 
      ? `${(price / 100000).toFixed(1)} L` 
      : price >= 1000 
      ? `${(price / 1000).toFixed(0)}k` 
      : price.toString();

    return L.divIcon({
      className: 'custom-leaflet-price-marker',
      html: `
        <div style="
          background: ${isSelected ? 'hsl(var(--primary))' : 'white'};
          color: ${isSelected ? 'hsl(var(--on-primary))' : 'hsl(var(--on-surface))'};
          border: 1.5px solid ${isSelected ? 'hsl(var(--primary))' : '#ddd'};
          border-radius: 99px;
          padding: 5px 11px;
          font-size: 11px;
          font-weight: 700;
          font-family: inherit;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          <span style="font-size: 12px;">🏠</span>
          ₹${priceText}
        </div>
      `,
      iconSize: [70, 26],
      iconAnchor: [35, 13],
    });
  };

  // Handle Location Detection in Leaflet / Mappls
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        // Reverse lookup using OpenStreetMap Nominatim API
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
          );
          const data = await resp.json();
          const parts = [];
          if (data.address?.road) parts.push(data.address.road);
          if (data.address?.suburb || data.address?.neighbourhood) {
            parts.push(data.address.suburb || data.address.neighbourhood);
          }
          if (data.address?.city || data.address?.town || data.address?.village) {
            parts.push(data.address.city || data.address.town || data.address.village);
          }
          if (data.address?.state) parts.push(data.address.state);
          
          props.mode === 'picker' && props.onLocationSelect(lat, lng, parts.join(', ') || data.display_name);
        } catch {
          props.mode === 'picker' && props.onLocationSelect(lat, lng);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        alert('Unable to retrieve location. Please check browser permissions.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLeafletMapClick = async (lat: number, lng: number) => {
    if (props.mode !== 'picker') return;
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
      );
      const data = await resp.json();
      const parts = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb || data.address?.neighbourhood) {
        parts.push(data.address.suburb || data.address.neighbourhood);
      }
      if (data.address?.city || data.address?.town || data.address?.village) {
        parts.push(data.address.city || data.address.town || data.address.village);
      }
      if (data.address?.state) parts.push(data.address.state);
      props.onLocationSelect(lat, lng, parts.join(', ') || data.display_name);
    } catch {
      props.onLocationSelect(lat, lng);
    }
  };

  // Mappls SDK Map Initialization & Synchronization
  useEffect(() => {
    if (!useMappls || !mapplsLoaded || !mapplsContainerRef.current) return;

    const mappls = (window as any).mappls;
    let initialCenter: { lat: number; lng: number } = { lat: 20.5937, lng: 78.9629 };
    let initialZoom = 5;

    if (props.mode === 'static') {
      initialCenter = { lat: props.latitude, lng: props.longitude };
      initialZoom = 15;
    } else if (props.mode === 'picker') {
      if (props.selectedLocation) {
        initialCenter = { lat: props.selectedLocation.lat, lng: props.selectedLocation.lng };
        initialZoom = 14;
      }
    } else if (props.mode === 'display') {
      const validProps = props.properties.filter((p) => p.latitude && p.longitude);
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((s, p) => s + p.latitude, 0) / validProps.length;
        const avgLng = validProps.reduce((s, p) => s + p.longitude, 0) / validProps.length;
        initialCenter = { lat: avgLat, lng: avgLng };
        initialZoom = validProps.length === 1 ? 13 : 8;
      }
    }

    const map = new mappls.Map(mapplsContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: props.mode !== 'static',
      hybrid: false,
    });

    mapplsInstanceRef.current = map;

    // Click Listener for Picker
    if (props.mode === 'picker') {
      const { onLocationSelect } = props;
      map.addListener('click', async (e: any) => {
        if (!e.lngLat) return;
        const lat = e.lngLat.lat;
        const lng = e.lngLat.lng;

        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
          );
          const data = await resp.json();
          const parts = [];
          if (data.address?.road) parts.push(data.address.road);
          if (data.address?.suburb || data.address?.neighbourhood) {
            parts.push(data.address.suburb || data.address.neighbourhood);
          }
          if (data.address?.city || data.address?.town || data.address?.village) {
            parts.push(data.address.city || data.address.town || data.address.village);
          }
          if (data.address?.state) parts.push(data.address.state);
          onLocationSelect(lat, lng, parts.join(', ') || data.display_name);
        } catch {
          onLocationSelect(lat, lng);
        }
      });
    }

    return () => {
      // Clean up markers
      mapplsMarkersRef.current.forEach((m) => {
        mappls.remove({ map, layer: m });
      });
      mapplsMarkersRef.current = [];
      mapplsInstanceRef.current = null;
    };
  }, [useMappls, mapplsLoaded]);

  // Synchronize Markers in Mappls
  useEffect(() => {
    const map = mapplsInstanceRef.current;
    if (!useMappls || !mapplsLoaded || !map) return;

    const mappls = (window as any).mappls;

    // Clear old markers
    mapplsMarkersRef.current.forEach((m) => {
      mappls.remove({ map, layer: m });
    });
    mapplsMarkersRef.current = [];

    if (props.mode === 'static') {
      const marker = new mappls.Marker({
        map: map,
        position: { lat: props.latitude, lng: props.longitude },
        popupOptions: true,
        popupHtml: `<div style="font-size:12px; font-weight:bold; padding:4px;">${props.label || 'Location'}</div>`
      });
      mapplsMarkersRef.current.push(marker);
      map.setCenter({ lat: props.latitude, lng: props.longitude });
    } else if (props.mode === 'picker' && props.selectedLocation) {
      const marker = new mappls.Marker({
        map: map,
        position: { lat: props.selectedLocation.lat, lng: props.selectedLocation.lng },
        popupOptions: true,
        popupHtml: '<div style="font-size:11px; padding:4px;">Selected Location</div>'
      });
      mapplsMarkersRef.current.push(marker);
      map.setCenter({ lat: props.selectedLocation.lat, lng: props.selectedLocation.lng });
    } else if (props.mode === 'display') {
      props.properties.forEach((prop) => {
        const isSelected = prop.id === props.selectedPropertyId;
        const priceText = prop.price >= 10000000 
          ? `${(prop.price / 10000000).toFixed(1)} Cr` 
          : prop.price >= 100000 
          ? `${(prop.price / 100000).toFixed(1)} L` 
          : prop.price >= 1000 
          ? `${(prop.price / 1000).toFixed(0)}k` 
          : prop.price.toString();

        const customHtml = `
          <div style="
            background: ${isSelected ? 'hsl(var(--primary))' : 'white'};
            color: ${isSelected ? 'hsl(var(--on-primary))' : 'hsl(var(--on-surface))'};
            border: 1.5px solid ${isSelected ? 'hsl(var(--primary))' : '#ddd'};
            border-radius: 99px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            font-family: inherit;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 3px;
            cursor: pointer;
          ">
            <span>🏠</span>
            ₹${priceText}
          </div>
        `;

        const popupHtml = `
          <div style="font-size: 11px; font-family: inherit; color: #333; min-width: 150px; padding: 4px;">
            <h4 style="margin: 0 0 2px; font-weight: bold; font-size: 12px;">${prop.title}</h4>
            <p style="margin: 0 0 4px; color: #666;">${prop.address}, ${prop.city}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: hsl(var(--primary));">₹${prop.price.toLocaleString('en-IN')}</span>
              ${prop.bedrooms ? `<span style="font-size: 9px; background: #eee; padding: 1px 4px; border-radius: 3px;">${prop.bedrooms} BHK</span>` : ''}
            </div>
          </div>
        `;

        const marker = new mappls.Marker({
          map: map,
          position: { lat: prop.latitude, lng: prop.longitude },
          html: customHtml,
          popupOptions: true,
          popupHtml: popupHtml
        });

        mapplsMarkersRef.current.push(marker);

        if (isSelected) {
          map.setCenter({ lat: prop.latitude, lng: prop.longitude });
          map.setZoom(13);
        }
      });
    }
  }, [props.mode, useMappls, mapplsLoaded, (props as any).properties, (props as any).selectedPropertyId, (props as any).selectedLocation, (props as any).latitude, (props as any).longitude]);

  // Leaflet render values
  const leafletState = getLeafletInitialState();

  return (
    <div className={`relative w-full h-full min-h-[300px] bg-surface-container-low/20 overflow-hidden ${props.className || ''}`}>
      
      {/* 1. Mappls SDK Map Render View */}
      {useMappls && (
        <div className="w-full h-full absolute inset-0">
          {!mapplsLoaded && (
            <div className="absolute inset-0 z-20 bg-surface/90 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: 28 }}>
                progress_activity
              </span>
              <span className="text-xs font-bold text-on-surface-variant">Loading Mappls India Maps...</span>
            </div>
          )}
          <div ref={mapplsContainerRef} className="w-full h-full" />
        </div>
      )}

      {/* 2. Leaflet Map Render View (Fallback / Default) */}
      {!useMappls && (
        <div className="w-full h-full absolute inset-0 z-10">
          <MapContainer
            center={leafletState.center}
            zoom={leafletState.zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
          >
            {/* CARTO Positron Light Theme Tiles - Stunning Minimal Gray, No CORS/Key errors */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            <LeafletMapController center={leafletState.center} zoom={leafletState.zoom} />

            {props.mode === 'picker' && (
              <LeafletMapClickHandler onClick={handleLeafletMapClick} />
            )}

            {/* Render Leaflet Static mode marker */}
            {props.mode === 'static' && (
              <LeafletMarker position={[props.latitude, props.longitude]}>
                {props.label && (
                  <LeafletPopup>
                    <span className="font-bold text-xs">{props.label}</span>
                  </LeafletPopup>
                )}
              </LeafletMarker>
            )}

            {/* Render Leaflet Picker Mode marker */}
            {props.mode === 'picker' && props.selectedLocation && (
              <LeafletMarker position={[props.selectedLocation.lat, props.selectedLocation.lng]}>
                <LeafletPopup>
                  <span className="text-xs">Selected Location</span>
                </LeafletPopup>
              </LeafletMarker>
            )}

            {/* Render Leaflet Display Mode list of markers */}
            {props.mode === 'display' &&
              props.properties
                .filter((p) => p.latitude && p.longitude)
                .map((prop) => {
                  const isSelected = prop.id === props.selectedPropertyId;
                  return (
                    <LeafletMarker
                      key={prop.id}
                      position={[prop.latitude, prop.longitude]}
                      icon={createLeafletPriceIcon(prop.price, isSelected)}
                      eventHandlers={{
                        click: () => props.onPropertySelect?.(prop),
                      }}
                    >
                      <LeafletPopup>
                        <div className="text-xs space-y-1 min-w-[160px] font-sans">
                          <p className="font-bold text-sm text-on-background">{prop.title}</p>
                          <p className="text-gray-500">{prop.address}, {prop.city}</p>
                          <p className="font-bold text-primary">₹{prop.price.toLocaleString('en-IN')}</p>
                          {prop.bedrooms && <p>{prop.bedrooms} BHK · {prop.type}</p>}
                        </div>
                      </LeafletPopup>
                    </LeafletMarker>
                  );
                })}
          </MapContainer>
        </div>
      )}

      {/* 3. Floating Quick Control Overlay widgets */}
      {props.mode === 'picker' && (
        <>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="absolute bottom-3 right-3 z-30 bg-surface/95 backdrop-blur-sm border border-outline-variant/30 px-3.5 py-1.5 rounded-lg text-xs font-label-md text-on-background flex items-center gap-1.5 shadow-lg hover:bg-surface-container-low transition-all disabled:opacity-50"
          >
            {geoLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 14 }}>
                  progress_activity
                </span>
                Locating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>
                  my_location
                </span>
                Use my location
              </>
            )}
          </button>
          
          <div className="absolute top-3 right-3 z-30 bg-surface/90 backdrop-blur-sm border border-outline-variant/30 px-3 py-1.5 rounded-lg text-[10px] text-on-surface-variant font-bold shadow-md">
            Click map to pin property
          </div>
        </>
      )}

      {/* Info indicator for developer */}
      {mapError && (
        <div className="absolute bottom-3 left-3 z-30 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded opacity-50 hover:opacity-100 transition-opacity">
          {mapError}
        </div>
      )}

    </div>
  );
};

export default MapView;
