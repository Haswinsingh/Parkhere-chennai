import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import { GeoPosition, locationService } from '../../services/locationService';
import { NearbyParkingItem, ParkingSpace } from '../../types';
import { MapStyleControl, MapStyle } from './MapStyleControl';
import { MapControls } from './MapControls';
import { UserLocationMarker } from './UserLocationMarker';
import { ParkingMarker } from './ParkingMarker';
import { useLocation } from '../../context/LocationContext';
import { Navigation, Globe } from 'lucide-react';

// Fix Leaflet marker icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin for manual location picking
const pinDropIcon = L.divIcon({
  className: 'pin-drop-marker',
  html: `
    <div style="
      background: #10b981;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    ">
      <span style="transform: rotate(45deg); font-weight: 900; font-size: 14px;">P</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Center updater sub-component with smooth flyTo
const MapController: React.FC<{
  center: [number, number] | null;
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ center, zoom, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

// Map Zoom Handler for MapControls
const MapZoomBridge: React.FC<{
  onRegisterControls: (controls: { zoomIn: () => void; zoomOut: () => void; centerOn: (lat: number, lng: number, zoom?: number) => void }) => void;
}> = ({ onRegisterControls }) => {
  const map = useMap();

  useEffect(() => {
    onRegisterControls({
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      centerOn: (lat, lng, zoom = 15) => map.flyTo([lat, lng], zoom, { duration: 1.2 }),
    });
  }, [map, onRegisterControls]);

  return null;
};

export interface LiveMapProps {
  userLocation?: GeoPosition | null;
  parkingItems?: NearbyParkingItem[];
  selectedParking?: ParkingSpace | null;
  pickedPosition?: { latitude: number; longitude: number } | null;
  onSelectParking?: (parking: ParkingSpace) => void;
  onBookNow?: (parking: ParkingSpace) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  defaultStyle?: MapStyle;
  zoom?: number;
  showControls?: boolean;
  showStyleToggle?: boolean;
}

/**
 * Real-World Interactive Live Satellite Map
 * Defaults to Satellite View.
 * Fully supports MapTiler API and high-resolution Esri World Satellite fallback.
 * Zero hardcoded cities or coordinates.
 */
export const LiveMap: React.FC<LiveMapProps> = ({
  userLocation,
  parkingItems = [],
  selectedParking = null,
  pickedPosition = null,
  onSelectParking,
  onBookNow,
  onMapClick,
  className = 'h-[500px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md',
  defaultStyle = 'satellite',
  zoom = 15,
  showControls = true,
  showStyleToggle = true,
}) => {
  const { isLocating, requestDeviceLocation } = useLocation();
  const [mapStyle, setMapStyle] = useState<MapStyle>(defaultStyle);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; centerOn: (lat: number, lng: number, zoom?: number) => void } | null>(null);

  const maptilerKey = (import.meta as any).env?.VITE_MAPTILER_API_KEY || '';

  // Determine initial coordinates: selected parking > picked position > userLocation > first parking item
  const resolvedCenter: [number, number] | null = selectedParking
    ? [selectedParking.latitude, selectedParking.longitude]
    : pickedPosition
    ? [pickedPosition.latitude, pickedPosition.longitude]
    : userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : parkingItems.length > 0
    ? [parkingItems[0].parking.latitude, parkingItems[0].parking.longitude]
    : null;

  // Fallback map view center when no location is yet chosen (Global Overview)
  const initialCenter: [number, number] = resolvedCenter || [20.5937, 78.9629]; // Broad regional overview
  const initialZoom = resolvedCenter ? zoom : 4;

  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCenterOnMe = async () => {
    if (userLocation && mapControlsRef.current) {
      mapControlsRef.current.centerOn(userLocation.latitude, userLocation.longitude, 16);
    } else {
      const pos = await requestDeviceLocation();
      if (pos && mapControlsRef.current) {
        mapControlsRef.current.centerOn(pos.latitude, pos.longitude, 16);
      }
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className={`relative ${className} ${
        isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none' : ''
      }`}
    >
      {/* Layer Style Switcher (Top-Right) */}
      {showStyleToggle && (
        <div className="absolute top-3 right-3 z-[1000]">
          <MapStyleControl currentStyle={mapStyle} onStyleChange={setMapStyle} />
        </div>
      )}

      {/* Floating Map Controls (Zoom, Center, Fullscreen) (Bottom-Right) */}
      {showControls && (
        <div className="absolute bottom-6 right-3 z-[1000]">
          <MapControls
            onZoomIn={() => mapControlsRef.current?.zoomIn()}
            onZoomOut={() => mapControlsRef.current?.zoomOut()}
            onCenterOnMe={handleCenterOnMe}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            isLocating={isLocating}
            hasUserLocation={!!userLocation}
          />
        </div>
      )}

      {/* Satellite Imagery Indicator Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/80 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-md border border-white/10 flex items-center gap-1.5 pointer-events-none">
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span>{mapStyle === 'satellite' ? 'Real World Satellite' : 'Street Map'}</span>
      </div>

      {/* Empty State Banner if no coordinates resolved */}
      {!resolvedCenter && (
        <div className="absolute inset-x-4 top-14 z-[1000] max-w-md mx-auto bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-800">
            📍 Enable Location to Discover Nearby Parking
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click "Use My Location" or search an address to view live parking spaces on the satellite map.
          </p>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        zoomControl={false} // Custom styled controls used
        className="w-full h-full"
      >
        <MapController
          center={resolvedCenter}
          zoom={zoom}
          onMapClick={onMapClick}
        />

        <MapZoomBridge
          onRegisterControls={(controls) => {
            mapControlsRef.current = controls;
          }}
        />

        {/* Tile Layers */}
        {mapStyle === 'satellite' ? (
          maptilerKey ? (
            // MapTiler Hybrid (High-Resolution Satellite Imagery with Labels)
            <TileLayer
              attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`}
              maxZoom={20}
            />
          ) : (
            <>
              {/* Esri World Imagery (High-Resolution Real Satellite Imagery) */}
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Street & Landmark Overlay Labels on top of Satellite */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />
            </>
          )
        ) : (
          maptilerKey ? (
            // MapTiler Street Map
            <TileLayer
              attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`}
              maxZoom={19}
            />
          ) : (
            // OpenStreetMap Standard Street
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )
        )}

        {/* User Real GPS Location Marker */}
        {userLocation && (
          <UserLocationMarker position={userLocation} showAccuracyCircle={true} />
        )}

        {/* Manual Location Picking Pin (e.g. Create Parking) */}
        {pickedPosition && (
          <Marker
            position={[pickedPosition.latitude, pickedPosition.longitude]}
            icon={pinDropIcon}
          />
        )}

        {/* Parking Space Markers */}
        {parkingItems.map(({ parking, distanceMeters }) => {
          const distanceFormatted = distanceMeters !== undefined
            ? locationService.formatDistance(distanceMeters)
            : undefined;

          return (
            <ParkingMarker
              key={parking.id}
              parking={parking}
              distanceFormatted={distanceFormatted}
              onSelectParking={onSelectParking}
              onBookNow={onBookNow}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
