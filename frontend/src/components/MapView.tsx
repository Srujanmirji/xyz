import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons (Leaflet's asset path issue with bundlers)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom primary-colored marker for properties
const createPropertyIcon = (isSelected: boolean) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--surface))'};
      color: ${isSelected ? 'hsl(var(--on-primary))' : 'hsl(var(--on-background))'};
      border: 2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--outline-variant))'};
      border-radius: 99px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-geist, system-ui);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
      transition: all 0.2s ease;
    ">
      <span style="font-size:14px;">🏠</span>
    </div>`,
    iconSize: [40, 28],
    iconAnchor: [20, 28],
    popupAnchor: [0, -30],
  });

// Custom user location marker
const userLocationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 18px; height: 18px;
    background: hsl(var(--primary));
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3), 0 2px 8px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Price-label marker for property listing map
const createPriceIcon = (price: number, isSelected: boolean) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--surface))'};
      color: ${isSelected ? 'hsl(var(--on-primary))' : 'hsl(var(--on-background))'};
      border: 2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--outline-variant))'};
      border-radius: 99px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-geist, system-ui);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
      transition: all 0.2s ease;
      cursor: pointer;
    ">
      <span style="font-size:13px;">🏠</span>
      $${price >= 1000000 ? (price / 1000000).toFixed(1) + 'M' : (price / 1000).toFixed(0) + 'K'}
    </div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 28],
    popupAnchor: [0, -30],
  });

// ============================================================
// Sub-component: Click handler for picker mode
// ============================================================
interface ClickHandlerProps {
  onClick: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<ClickHandlerProps> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Sub-component: Fly the map to a target when it changes
const FlyToLocation: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 || center[1] !== 0) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center[0], center[1]]);
  return null;
};

// ============================================================
// Property type for display mode
// ============================================================
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

// ============================================================
// Main MapView Component
// ============================================================
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

export const MapView: React.FC<MapViewProps> = (props) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  // ---- STATIC MODE (single pin on detail page) ----
  if (props.mode === 'static') {
    const center: [number, number] = [props.latitude, props.longitude];
    return (
      <div className={`rounded-xl overflow-hidden border border-outline-variant/20 ${props.className || ''}`}>
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', minHeight: '280px' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} icon={createPropertyIcon(true)}>
            {props.label && (
              <Popup>
                <span className="text-sm font-bold">{props.label}</span>
              </Popup>
            )}
          </Marker>
        </MapContainer>
      </div>
    );
  }

  // ---- PICKER MODE (profile / onboarding) ----
  if (props.mode === 'picker') {
    const { selectedLocation, onLocationSelect } = props;
    const center: [number, number] = selectedLocation
      ? [selectedLocation.lat, selectedLocation.lng]
      : [39.8283, -98.5795]; // Center of US

    const handleMapClick = async (lat: number, lng: number) => {
      // Reverse geocode with Nominatim
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
        );
        const data = await resp.json();
        const parts = [];
        if (data.address?.city || data.address?.town || data.address?.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address?.state) parts.push(data.address.state);
        if (data.address?.country) parts.push(data.address.country);
        onLocationSelect(lat, lng, parts.join(', ') || data.display_name);
      } catch {
        onLocationSelect(lat, lng);
      }
    };

    const handleUseMyLocation = () => {
      if (!navigator.geolocation) return;
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setFlyTarget([lat, lng]);
          await handleMapClick(lat, lng);
          setGeoLoading(false);
        },
        () => {
          setGeoLoading(false);
          alert('Unable to access your location. Please allow location access or click on the map.');
        },
        { enableHighAccuracy: true }
      );
    };

    return (
      <div className={`space-y-2 ${props.className || ''}`}>
        <div className="rounded-xl overflow-hidden border border-outline-variant/20 relative">
          <MapContainer
            center={center}
            zoom={selectedLocation ? 13 : 4}
            scrollWheelZoom={true}
            style={{ height: '260px', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onClick={handleMapClick} />
            {flyTarget && <FlyToLocation center={flyTarget} zoom={13} />}
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={userLocationIcon}
              />
            )}
          </MapContainer>

          {/* Use My Location button overlay */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="absolute bottom-3 right-3 z-[1000] bg-surface/95 backdrop-blur-sm border border-outline-variant/30 px-3 py-1.5 rounded-lg text-xs font-label-md text-on-background flex items-center gap-1.5 shadow-lg hover:bg-surface-container-low transition-all disabled:opacity-50"
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
        </div>
        <p className="text-[11px] text-on-surface-variant italic">
          Click anywhere on the map to set your location, or use the button to auto-detect.
        </p>
      </div>
    );
  }

  // ---- DISPLAY MODE (property listing map) ----
  const { properties, selectedPropertyId, onPropertySelect } = props;

  // Compute bounding box
  const validProps = properties.filter((p) => p.latitude && p.longitude);
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const center: [number, number] =
    validProps.length > 0
      ? [
          validProps.reduce((s, p) => s + p.latitude, 0) / validProps.length,
          validProps.reduce((s, p) => s + p.longitude, 0) / validProps.length,
        ]
      : defaultCenter;

  const selectedProp = validProps.find((p) => p.id === selectedPropertyId);
  const flyTo: [number, number] | null = selectedProp
    ? [selectedProp.latitude, selectedProp.longitude]
    : null;

  return (
    <div className={`rounded-none overflow-hidden ${props.className || ''}`}>
      <MapContainer
        center={center}
        zoom={validProps.length === 1 ? 13 : 5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {flyTo && <FlyToLocation center={flyTo} zoom={12} />}
        {validProps.map((prop) => {
          const isSelected = prop.id === selectedPropertyId;
          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={createPriceIcon(prop.price, isSelected)}
              eventHandlers={{
                click: () => onPropertySelect?.(prop),
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-bold text-sm">{prop.title}</p>
                  <p className="text-gray-500">{prop.address}, {prop.city}</p>
                  <p className="font-bold text-primary">${prop.price.toLocaleString()}</p>
                  {prop.bedrooms && <p>{prop.bedrooms} beds · {prop.type}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
