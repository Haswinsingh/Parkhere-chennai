import React, { useState } from 'react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ShieldAlert,
} from 'lucide-react';

interface ArrivalModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export const ArrivalModal: React.FC<ArrivalModalProps> = ({ booking, onClose, onSuccess }) => {
  if (!booking) return null;

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [hasDamage, setHasDamage] = useState<boolean>(false);
  const [damageDescription, setDamageDescription] = useState<string>('');
  const [damagePhotos, setDamagePhotos] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Acquire current device location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
        setLocationStatus('GPS Coordinates acquired successfully');
      },
      (err) => {
        setIsLocating(false);
        setError(`Unable to retrieve GPS: ${err.message}. Please enable location permissions.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVehiclePhoto(e.target.files[0]);
    }
  };

  const handleDamagePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDamagePhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude === null || longitude === null) {
      setError('Please click "Detect My Location" first to verify your arrival distance.');
      return;
    }

    if (!vehiclePhoto) {
      setError('Vehicle photo is compulsory for arrival verification.');
      return;
    }

    if (hasDamage && !damageDescription && damagePhotos.length === 0) {
      setError('Please provide description or photos of the pre-existing damage.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('vehiclePhoto', vehiclePhoto);
      formData.append('damageReported', hasDamage.toString());

      if (hasDamage) {
        if (damageDescription) formData.append('damageDescription', damageDescription);
        damagePhotos.forEach((file) => formData.append('damagePhotos', file));
      }

      const res = await bookingService.submitArrival(booking.id, formData);

      if (res.success && res.data?.booking) {
        onSuccess(res.data.booking);
      } else {
        setError(res.message || 'Arrival submission could not be verified.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'You appear to be away from the parking location. (Must be within 100 meters).';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Vehicle Arrival Verification</h3>
            <p className="text-xs text-slate-500">
              {(booking.parkingId as any)?.name || 'Parking Location'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Real GPS Proximity Check */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. GPS Proximity Verification
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Must be within 100m</span>
            </div>

            <p className="text-xs text-slate-600">
              To verify you have reached the parking entrance, check in with your device's high-accuracy GPS coordinates.
            </p>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`w-full py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                latitude !== null
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {isLocating
                ? 'Acquiring GPS Signal...'
                : latitude !== null
                ? 'GPS Coordinates Verified ✓'
                : 'Detect My Location'}
            </button>

            {latitude !== null && (
              <p className="text-[11px] text-emerald-700 font-mono text-center">
                Lat: {latitude.toFixed(5)}, Lng: {longitude?.toFixed(5)}
              </p>
            )}
          </div>

          {/* Step 2: Vehicle Inspection Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Vehicle Verification Photo (Compulsory)
              </label>
              <span className="text-[10px] text-slate-400">JPG, PNG</span>
            </div>
            <p className="text-xs text-slate-500">
              Capture or upload a clear photo of your parked vehicle with number plate visible.
            </p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              required
              onChange={handleVehiclePhotoChange}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {vehiclePhoto && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {vehiclePhoto.name} selected
              </p>
            )}
          </div>

          {/* Step 3: Damage Evidence Declaration */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                3. Pre-existing Vehicle Damage Declaration
              </span>
              <p className="text-[11px] text-slate-500">
                Does your vehicle have any existing scratches, dents or damages before parking?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setHasDamage(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !hasDamage
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                No Pre-existing Damage
              </button>
              <button
                type="button"
                onClick={() => setHasDamage(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  hasDamage
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Report Existing Damage
              </button>
            </div>

            {hasDamage && (
              <div className="space-y-3 pt-2 border-t border-amber-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Describe Damage
                  </label>
                  <textarea
                    rows={2}
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    placeholder="e.g. Scratches on left front bumper..."
                    className="w-full p-2 text-xs border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Upload Damage Evidence Photos (Up to 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDamagePhotosChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                  />
                  {damagePhotos.length > 0 && (
                    <p className="text-xs text-amber-700 mt-1 font-medium">
                      {damagePhotos.length} damage photo(s) selected
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Arrival */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300"
          >
            {isSubmitting ? 'Verifying Coordinates & Uploading...' : 'Submit Arrival for Host Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};
