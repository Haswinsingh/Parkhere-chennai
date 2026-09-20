import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ParkingSpace } from '../../types';
import { ParkingPopup } from './ParkingPopup';

const createParkingIcon = (availableSlots: number, isClosed: boolean) => {
  let colorBg = '#10b981'; // emerald-500
  let badgeText = `${availableSlots}P`;

  if (isClosed || availableSlots === 0) {
    colorBg = '#ef4444'; // red-500
    badgeText = isClosed ? 'OFF' : '0P';
  } else if (availableSlots <= 3) {
    colorBg = '#f59e0b'; // amber-500
    badgeText = `${availableSlots}P`;
  }

  return L.divIcon({
    className: 'parking-marker-pin',
    html: `
      <div style="
        background-color: ${colorBg};
        color: white;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>${badgeText}</span>
      </div>
    `,
    iconSize: [46, 26],
    iconAnchor: [23, 13],
  });
};

interface ParkingMarkerProps {
  parking: ParkingSpace;
  distanceFormatted?: string;
  onSelectParking?: (parking: ParkingSpace) => void;
  onBookNow?: (parking: ParkingSpace) => void;
}

export const ParkingMarker: React.FC<ParkingMarkerProps> = ({
  parking,
  distanceFormatted,
  onSelectParking,
  onBookNow,
}) => {
  const isClosed = parking.status === 'closed';
  const icon = createParkingIcon(parking.availableSlots, isClosed);

  return (
    <Marker position={[parking.latitude, parking.longitude]} icon={icon}>
      <Popup className="custom-parking-popup">
        <ParkingPopup
          parking={parking}
          distanceFormatted={distanceFormatted}
          onSelectParking={onSelectParking}
          onBookNow={onBookNow}
        />
      </Popup>
    </Marker>
  );
};
