import React from 'react';
import { ParkingSpace } from '../../types';
import { getMediaUrl } from '../../services/api';
import { Video, Lock, ShieldCheck, MapPin } from 'lucide-react';

interface ParkingPopupProps {
  parking: ParkingSpace;
  distanceFormatted?: string;
  onSelectParking?: (parking: ParkingSpace) => void;
  onBookNow?: (parking: ParkingSpace) => void;
}

export const ParkingPopup: React.FC<ParkingPopupProps> = ({
  parking,
  distanceFormatted,
  onSelectParking,
  onBookNow,
}) => {
  const isClosed = parking.status === 'closed';
  const isFull = parking.availableSlots === 0;
  const firstPhoto = parking.photos && parking.photos[0] ? getMediaUrl(parking.photos[0]) : '';

  return (
    <div className="w-60 p-1 text-slate-900 font-sans">
      {firstPhoto && (
        <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2 shadow-inner bg-slate-100">
          <img
            src={firstPhoto}
            alt={parking.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ₹{parking.pricePerHour}/hr
          </div>
        </div>
      )}

      <div className="mb-2">
        <h4 className="font-bold text-sm text-slate-950 leading-tight">
          {parking.name}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
          {parking.address}
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-2">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Slots</span>
          <span
            className={`font-extrabold ${
              isFull || isClosed ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {isClosed ? 'Closed' : `${parking.availableSlots} / ${parking.totalSlots}`}
          </span>
        </div>

        {distanceFormatted && (
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
            <span className="font-bold text-slate-700">{distanceFormatted}</span>
          </div>
        )}

        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Type</span>
          <span className="font-bold text-slate-700">{parking.parkingType}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Security</span>
          <span className="font-bold text-slate-700">
            {parking.cctvAvailable && parking.gateAvailable ? 'CCTV + Gate' : parking.cctvAvailable ? 'CCTV' : 'Standard'}
          </span>
        </div>
      </div>

      {/* Amenities icons */}
      <div className="flex items-center gap-1.5 mb-3 text-[10px] text-slate-600">
        {parking.cctvAvailable && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
            <Video className="w-3 h-3 text-emerald-600" /> CCTV
          </span>
        )}
        {parking.gateAvailable && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> Gate
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onSelectParking && (
          <button
            type="button"
            onClick={() => onSelectParking(parking)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Details
          </button>
        )}
        {onBookNow && (
          <button
            type="button"
            onClick={() => onBookNow(parking)}
            disabled={isFull || isClosed}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg text-white transition-all shadow-sm ${
              isFull || isClosed
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isClosed ? 'Closed' : isFull ? 'Full' : 'Book Now'}
          </button>
        )}
      </div>
    </div>
  );
};
