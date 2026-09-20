import React, { useState, useEffect } from 'react';
import { locationService, GeoPosition } from '../services/locationService';
import { LiveMap } from './map/LiveMap';
import { SearchLocation } from './map/SearchLocation';
import { LocationButton } from './map/LocationButton';
import { MapPin, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LocationPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  className?: string;
}

/**
 * Real-world Satellite Location Picker for Parking Holders
 * Pinpoint exact driveways, garages, and parking spots on real satellite imagery.
 * Zero form nesting, zero hardcoded coordinates.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  className = '',
}) => {
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );
  const [resolvedAddress, setResolvedAddress] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const handleUpdateCoordinates = async (lat: number, lng: number, customAddress?: string) => {
    setSelectedCoords({ latitude: lat, longitude: lng });

    if (customAddress) {
      setResolvedAddress(customAddress);
      onLocationSelect(lat, lng, customAddress);
      return;
    }

    setIsResolving(true);
    try {
      const details = await locationService.reverseGeocode(lat, lng);
      setResolvedAddress(details.formattedAddress);
      onLocationSelect(lat, lng, details.formattedAddress);
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setResolvedAddress(fallback);
      onLocationSelect(lat, lng, fallback);
    } finally {
      setIsResolving(false);
    }
  };

  const handleLocationObtained = (coords: { latitude: number; longitude: number }) => {
    handleUpdateCoordinates(coords.latitude, coords.longitude);
  };

  const handleMapClick = (lat: number, lng: number) => {
    handleUpdateCoordinates(lat, lng);
  };

  // Convert selected coords to GeoPosition for LiveMap
  const userPos: GeoPosition | null = selectedCoords
    ? {
        latitude: selectedCoords.latitude,
        longitude: selectedCoords.longitude,
        timestamp: Date.now(),
      }
    : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Controls Header: Search Bar and Universal Location Button (No <form> tags used) */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <SearchLocation
          placeholder="Search street name, building or area..."
          onLocationSelected={(loc) => {
            handleUpdateCoordinates(loc.latitude, loc.longitude, loc.displayName);
          }}
        />

        <LocationButton
          onLocationObtained={handleLocationObtained}
          variant="secondary"
          showAccuracy={true}
        />
      </div>

      {/* Satellite Map with Click-to-Pin Feature */}
      <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <LiveMap
          pickedPosition={selectedCoords}
          userLocation={userPos}
          onMapClick={handleMapClick}
          defaultStyle="satellite"
          zoom={17} // Closer zoom for precision parking spot placement
          className="w-full h-full"
          showControls={true}
          showStyleToggle={true}
        />

        {/* Floating Instruction Banner */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] bg-slate-900/85 backdrop-blur text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-md border border-white/10 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Click anywhere on the satellite view to set your exact parking entrance pin</span>
        </div>
      </div>

      {/* Selected Coordinates & Address Confirmation Card */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Confirmed Parking Coordinates:
          </span>
          {selectedCoords ? (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
              Ready to Save
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Pin Required
            </span>
          )}
        </div>

        {selectedCoords ? (
          <>
            <div className="flex gap-4 text-slate-700 font-mono text-[11px] pt-0.5">
              <span>Latitude: <strong>{selectedCoords.latitude.toFixed(6)}</strong></span>
              <span>Longitude: <strong>{selectedCoords.longitude.toFixed(6)}</strong></span>
            </div>
            {resolvedAddress && (
              <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200 truncate">
                <span className="font-semibold text-slate-700">Detected Address: </span>
                {isResolving ? 'Resolving street address...' : resolvedAddress}
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-500 text-[11px]">
            Please click <strong>"Use My Location"</strong> or click on the map above to select your parking spot's real GPS position.
          </p>
        )}
      </div>
    </div>
  );
};
