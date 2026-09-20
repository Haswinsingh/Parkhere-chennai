import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { locationService, GeoPosition, AddressDetails, GeocodedLocation } from '../services/locationService';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  coordinates: Coordinates | null; // Active focal coordinates
  deviceLocation: GeoPosition | null; // Physical GPS location from browser
  selectedLocation: GeoPosition | null; // Manually searched or pinned location
  activeLocation: GeoPosition | null; // Resolved current focal position
  accuracyMeters: number | null;
  locationName: string;
  addressDetails: AddressDetails | null;
  isLocating: boolean;
  locationError: string | null;
  isUsingDeviceLocation: boolean;
  isLiveTracking: boolean;
  requestDeviceLocation: () => Promise<GeoPosition | null>;
  searchAndSetLocation: (query: string) => Promise<GeoPosition | null>;
  setManualCoordinates: (coords: Coordinates, name?: string) => Promise<void>;
  clearManualLocation: () => void;
  toggleLiveTracking: () => void;
  formatDistance: (meters: number) => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deviceLocation, setDeviceLocation] = useState<GeoPosition | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GeoPosition | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('Location not selected');
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isUsingDeviceLocation, setIsUsingDeviceLocation] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Resolved active position (manual search overrides device location until cleared)
  const activeLocation: GeoPosition | null = selectedLocation || deviceLocation;
  const coordinates: Coordinates | null = activeLocation
    ? { latitude: activeLocation.latitude, longitude: activeLocation.longitude }
    : null;

  /**
   * Request actual device location once using centralized locationService
   */
  const requestDeviceLocation = useCallback(async (): Promise<GeoPosition | null> => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const pos = await locationService.getCurrentLocation();
      setDeviceLocation(pos);
      setAccuracyMeters(pos.accuracy ? Math.round(pos.accuracy) : null);
      setSelectedLocation(null); // Switch focus back to device GPS
      setIsUsingDeviceLocation(true);

      try {
        const details = await locationService.reverseGeocode(pos.latitude, pos.longitude);
        setAddressDetails(details);
        const label = details.locality || details.city
          ? `${details.locality ? details.locality + ', ' : ''}${details.city}`
          : details.formattedAddress;
        setLocationName(`Current Location (${label})`);
      } catch {
        setLocationName('Current Device Location');
      }

      return pos;
    } catch (err: any) {
      setLocationError(err.message || 'Unable to retrieve your location. Search an area manually.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  /**
   * Forward geocode query and set as active selected location
   */
  const searchAndSetLocation = useCallback(async (query: string): Promise<GeoPosition | null> => {
    if (!query || !query.trim()) return null;

    setIsLocating(true);
    setLocationError(null);

    try {
      const results: GeocodedLocation[] = await locationService.geocodeAddress(query);
      if (results.length > 0) {
        const first = results[0];
        const newPos: GeoPosition = {
          latitude: first.latitude,
          longitude: first.longitude,
          accuracy: undefined,
          timestamp: Date.now(),
        };

        setSelectedLocation(newPos);
        setIsUsingDeviceLocation(false);
        setLocationName(first.shortName || first.displayName);

        // Fetch detailed address breakdown
        try {
          const details = await locationService.reverseGeocode(newPos.latitude, newPos.longitude);
          setAddressDetails(details);
        } catch {
          // Keep existing name
        }

        return newPos;
      } else {
        setLocationError(`No results found for "${query}". Try searching by street name, landmark, or city.`);
        return null;
      }
    } catch {
      setLocationError('Unable to connect to location search service. Please try again.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  /**
   * Set coordinates manually from map pin drop or user action
   */
  const setManualCoordinates = useCallback(async (coords: Coordinates, name?: string) => {
    const newPos: GeoPosition = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: undefined,
      timestamp: Date.now(),
    };

    setSelectedLocation(newPos);
    setIsUsingDeviceLocation(false);

    if (name) {
      setLocationName(name);
    }

    try {
      const details = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      setAddressDetails(details);
      if (!name) {
        setLocationName(details.formattedAddress);
      }
    } catch {
      if (!name) {
        setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    }
  }, []);

  /**
   * Clear manual selection and return to device location
   */
  const clearManualLocation = useCallback(() => {
    setSelectedLocation(null);
    if (deviceLocation) {
      setIsUsingDeviceLocation(true);
      setLocationName('Current Device Location');
    } else {
      setIsUsingDeviceLocation(false);
      setLocationName('Location not selected');
    }
  }, [deviceLocation]);

  /**
   * Toggle real-time live location tracking
   */
  const toggleLiveTracking = useCallback(() => {
    if (isLiveTracking && watchId !== null) {
      locationService.clearLocationWatch(watchId);
      setWatchId(null);
      setIsLiveTracking(false);
    } else {
      const id = locationService.watchLocation(
        (newPos) => {
          setDeviceLocation(newPos);
          setAccuracyMeters(newPos.accuracy ? Math.round(newPos.accuracy) : null);
          if (!selectedLocation) {
            setIsUsingDeviceLocation(true);
          }
        },
        (err) => {
          console.warn('Live tracking warning:', err.message);
        }
      );
      if (id !== null) {
        setWatchId(id);
        setIsLiveTracking(true);
      }
    }
  }, [isLiveTracking, watchId, selectedLocation]);

  // Clean up watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        locationService.clearLocationWatch(watchId);
      }
    };
  }, [watchId]);

  // Attempt initial device location detection on mount
  useEffect(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        deviceLocation,
        selectedLocation,
        activeLocation,
        accuracyMeters,
        locationName,
        addressDetails,
        isLocating,
        locationError,
        isUsingDeviceLocation,
        isLiveTracking,
        requestDeviceLocation,
        searchAndSetLocation,
        setManualCoordinates,
        clearManualLocation,
        toggleLiveTracking,
        formatDistance: locationService.formatDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
