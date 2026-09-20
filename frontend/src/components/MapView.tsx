import React from 'react';
import { Coordinates } from '../context/LocationContext';
import { NearbyParkingItem, ParkingSpace } from '../types';
import { LiveMap } from './map/LiveMap';
import { GeoPosition } from '../services/locationService';

export interface MapViewProps {
  userLocation: Coordinates | null;
  parkingItems: NearbyParkingItem[];
  selectedParking?: ParkingSpace | null;
  onSelectParking?: (parking: ParkingSpace) => void;
  onBookNow?: (parking: ParkingSpace) => void;
  className?: string;
  zoom?: number;
}

/**
 * Backward-compatible MapView wrapper using the new LiveMap satellite system.
 * Zero hardcoded coordinates. Defaults to real-world satellite imagery.
 */
export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  parkingItems,
  selectedParking,
  onSelectParking,
  onBookNow,
  className,
  zoom = 15,
}) => {
  const geoPos: GeoPosition | null = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      }
    : null;

  return (
    <LiveMap
      userLocation={geoPos}
      parkingItems={parkingItems}
      selectedParking={selectedParking}
      onSelectParking={onSelectParking}
      onBookNow={onBookNow}
      className={className}
      zoom={zoom}
      defaultStyle="satellite"
    />
  );
};
