export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export interface AddressDetails {
  formattedAddress: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  shortName: string;
}

const DEFAULT_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Universal Location Service
 * Implemented once and reused everywhere in ParkHere.
 * Eliminates all hardcoded coordinates and provides real-world GPS + Geocoding.
 */
class LocationService {
  /**
   * Request actual device coordinates via browser Geolocation API
   */
  public getCurrentLocation(options: PositionOptions = DEFAULT_GEO_OPTIONS): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser or device.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = 'Unable to retrieve your device location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. Please allow location permissions or search an address manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'GPS location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'The location request timed out. Please try again.';
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  /**
   * Watch device coordinates in real-time as the user moves
   */
  public watchLocation(
    onUpdate: (position: GeoPosition) => void,
    onError: (error: Error) => void,
    options: PositionOptions = DEFAULT_GEO_OPTIONS
  ): number | null {
    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported by your browser.'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        onError(new Error(error.message || 'Error tracking live location.'));
      },
      options
    );
  }

  /**
   * Stop watching real-time location
   */
  public clearLocationWatch(watchId: number): void {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Convert coordinates to human-readable address components via Nominatim
   */
  public async reverseGeocode(latitude: number, longitude: number): Promise<AddressDetails> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ParkHere-SmartParking/1.0',
        },
      });

      if (!res.ok) {
        throw new Error('Reverse geocoding service unavailable');
      }

      const data = await res.json();
      const addr = data.address || {};

      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.quarter ||
        addr.road ||
        '';

      const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
      const state = addr.state || addr.region || '';
      const country = addr.country || '';
      const postalCode = addr.postcode || '';

      const formattedParts = [locality, city, state].filter(Boolean);
      const formattedAddress = data.display_name || formattedParts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      return {
        formattedAddress,
        locality,
        city,
        state,
        country,
        postalCode,
      };
    } catch {
      return {
        formattedAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        locality: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      };
    }
  }

  /**
   * Forward geocode query to geographic coordinates
   */
  public async geocodeAddress(query: string): Promise<GeocodedLocation[]> {
    if (!query || !query.trim()) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ParkHere-SmartParking/1.0',
        },
      });

      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => {
        const parts = (item.display_name || '').split(',');
        const shortName = parts.slice(0, 2).join(',').trim() || item.name || 'Location';
        return {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
          shortName,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Haversine distance formula between two GPS points in meters
   */
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * User-friendly distance formatter (meters or kilometers)
   */
  public formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

export const locationService = new LocationService();
