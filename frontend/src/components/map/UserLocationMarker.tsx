import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { GeoPosition } from '../../services/locationService';

// Custom pulsing blue dot for user's real GPS position
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(37, 99, 235, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: 3px; border-radius: 50%; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.35);"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

interface UserLocationMarkerProps {
  position: GeoPosition;
  showAccuracyCircle?: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  position,
  showAccuracyCircle = true,
}) => {
  const icon = createUserLocationIcon();

  return (
    <>
      <Marker position={[position.latitude, position.longitude]} icon={icon}>
        <Popup className="user-location-popup">
          <div className="p-1 text-xs font-sans text-slate-800">
            <p className="font-bold flex items-center gap-1.5 text-blue-700">
              🔵 Your Live Location
            </p>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Lat: {position.latitude.toFixed(5)}, Lng: {position.longitude.toFixed(5)}
            </div>
            {position.accuracy && (
              <div className="mt-1 text-[10px] text-slate-400">
                GPS Accuracy: ±{Math.round(position.accuracy)} meters
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {showAccuracyCircle && position.accuracy && position.accuracy > 5 && (
        <Circle
          center={[position.latitude, position.longitude]}
          radius={Math.min(position.accuracy, 500)} // Cap visual circle to avoid covering entire city
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '3, 6',
          }}
        />
      )}
    </>
  );
};
