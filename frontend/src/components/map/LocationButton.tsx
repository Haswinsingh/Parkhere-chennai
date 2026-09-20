import React from 'react';
import { Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

interface LocationButtonProps {
  onLocationObtained?: (coords: { latitude: number; longitude: number }) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
  showAccuracy?: boolean;
}

/**
 * Universal "Use My Location" button component.
 * Implemented once and reused across Find Parking, Live Map, and Create Parking.
 */
export const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationObtained,
  className = '',
  variant = 'secondary',
  showAccuracy = false,
}) => {
  const {
    requestDeviceLocation,
    isLocating,
    locationError,
    isUsingDeviceLocation,
    accuracyMeters,
  } = useLocation();

  const handleClick = async () => {
    const coords = await requestDeviceLocation();
    if (coords && onLocationObtained) {
      onLocationObtained(coords);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocating}
        className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
          isUsingDeviceLocation
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
        } ${className}`}
        title="Use My Device Location"
      >
        <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
      </button>
    );
  }

  const baseStyles =
    variant === 'primary'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
      : isUsingDeviceLocation
      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm';

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocating}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${baseStyles} ${
          isLocating ? 'opacity-80 cursor-wait' : ''
        } ${className}`}
      >
        <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        <span>
          {isLocating
            ? 'Detecting GPS...'
            : isUsingDeviceLocation
            ? 'Device Location Active'
            : 'Use My Location'}
        </span>

        {showAccuracy && isUsingDeviceLocation && accuracyMeters !== null && (
          <span className="text-[10px] bg-blue-200/60 text-blue-900 px-1.5 py-0.5 rounded-md font-mono">
            ±{accuracyMeters}m
          </span>
        )}
      </button>

      {locationError && (
        <span className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {locationError}
        </span>
      )}
    </div>
  );
};
