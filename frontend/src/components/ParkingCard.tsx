import React from 'react';
import { ParkingSpace } from '../types';
import { getMediaUrl } from '../services/api';
import { ShieldCheck, Video, Lock, MapPin, Star, Clock } from 'lucide-react';

interface ParkingCardProps {
  parking: ParkingSpace;
  distanceMeters?: number;
  onBook: (parking: ParkingSpace) => void;
  onViewDetails?: (parking: ParkingSpace) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  parking,
  distanceMeters,
  onBook,
  onViewDetails,
}) => {
  const isClosed = parking.status === 'closed';
  const isFull = parking.availableSlots === 0;
  const isBookable = !isClosed && !isFull;

  const photo = parking.photos && parking.photos.length > 0 ? getMediaUrl(parking.photos[0]) : '';

  const formatDistance = (meters?: number) => {
    if (meters === undefined) return '';
    return meters < 1000 ? `${meters}m away` : `${(meters / 1000).toFixed(1)}km away`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Photo Banner with Badges */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={parking.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No photo available
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute top-3 left-3 flex gap-1.5 items-center">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                isFull || isClosed
                  ? 'bg-red-500 text-white'
                  : parking.availableSlots <= 3
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isClosed ? 'CLOSED' : isFull ? 'FULL' : `${parking.availableSlots} Slots Available`}
            </span>
          </div>

          {/* Verification Badge */}
          {parking.verified && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </div>
          )}

          {/* Distance Indicator */}
          {distanceMeters !== undefined && (
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {formatDistance(distanceMeters)}
            </div>
          )}
        </div>

        {/* Details Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                {parking.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{parking.address}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-emerald-600">₹{parking.pricePerHour}</span>
              <span className="text-xs text-slate-400 block -mt-1">/hour</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1">
            <span className="font-semibold text-slate-700">Landmark:</span> {parking.landmark}
          </p>

          {/* Amenities & Security */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
              {parking.parkingType}
            </span>
            {parking.cctvAvailable && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium">
                <Video className="w-3 h-3 text-emerald-600" /> CCTV
              </span>
            )}
            {parking.gateAvailable && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium">
                <Lock className="w-3 h-3 text-emerald-600" /> Gated
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
              <Clock className="w-3 h-3" /> {parking.openingTime} - {parking.closingTime}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 border-t border-slate-100 flex gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(parking)}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Details
          </button>
        )}
        <button
          onClick={() => onBook(parking)}
          disabled={!isBookable}
          className={`flex-1 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm ${
            !isBookable
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow'
          }`}
        >
          {isClosed ? 'Closed' : isFull ? 'Slot Full' : 'Book Parking'}
        </button>
      </div>
    </div>
  );
};
