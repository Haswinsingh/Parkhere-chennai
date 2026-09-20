import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parkingService } from '../../services/parkingService';
import { api } from '../../services/api';
import { LocationPicker } from '../../components/LocationPicker';
import { ParkingType } from '../../types';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Camera,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const CreateParkingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [totalSlots, setTotalSlots] = useState<number>(5);
  const [pricePerHour, setPricePerHour] = useState<number>(40);
  const [parkingType, setParkingType] = useState<ParkingType>('Covered');
  const [landmark, setLandmark] = useState<string>('');
  const [cctvAvailable, setCctvAvailable] = useState<boolean>(true);
  const [gateAvailable, setGateAvailable] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>('06:00');
  const [closingTime, setClosingTime] = useState<string>('23:00');
  const [photos, setPhotos] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (!address || address.length < 5) {
      setAddress(addr);
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (user?.verificationStatus !== 'approved' && user?.role !== 'admin') {
      setError('Your host account is pending verification. Please click "Verify Host Account Now" above before publishing.');
      return;
    }

    if (latitude === null || longitude === null) {
      setError('Please pinpoint and confirm your parking space GPS coordinates on the satellite map below.');
      return;
    }

    if (photos.length < 2) {
      setError('Please upload at least 2 parking photos showing the entrance and parking area.');
      return;
    }

    if (!landmark.trim()) {
      setError('Landmark is required so drivers can find your space easily.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('address', address.trim());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('totalSlots', totalSlots.toString());
      formData.append('availableSlots', totalSlots.toString());
      formData.append('pricePerHour', pricePerHour.toString());
      formData.append('parkingType', parkingType);
      formData.append('landmark', landmark.trim());
      formData.append('cctvAvailable', cctvAvailable.toString());
      formData.append('gateAvailable', gateAvailable.toString());
      formData.append('openingTime', openingTime);
      formData.append('closingTime', closingTime);

      photos.forEach((photo) => formData.append('photos', photo));

      const res = await parkingService.create(formData);

      if (res.success) {
        navigate('/parking-holder/parking');
      } else {
        setError(res.message || 'Failed to list parking facility.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to publish parking space. Ensure your host account is verified.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isVerifyingHost, setIsVerifyingHost] = useState<boolean>(false);

  const handleQuickVerify = async () => {
    setIsVerifyingHost(true);
    try {
      const res = await api.post('/verification/verify-me');
      if (res.data?.success) {
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification error.');
    } finally {
      setIsVerifyingHost(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Parking Space
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          List a new parking location with real GPS coordinates, slot capacity, and hourly pricing.
        </p>
      </div>

      {user?.verificationStatus !== 'approved' ? (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Host Verification Notice
            </p>
            <p className="text-amber-800">
              Your account is currently in <strong>{user?.verificationStatus || 'pending'}</strong> review. Click the button to verify your host credentials and enable publishing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickVerify}
            disabled={isVerifyingHost}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors shrink-0 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {isVerifyingHost ? 'Verifying...' : 'Verify Host Account Now'}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Host Account Verified & Approved</span>
          <span className="text-emerald-700">• Your published parking spaces will appear immediately on the Live Map.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Basic Facility Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Facility Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Parking Space Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Green Towers Covered Driveway"
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Street Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 102 Green Street, Metro Plaza"
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Prominent Landmark *
            </label>
            <input
              type="text"
              required
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Metro Pillar 42 / Next to City Bank"
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* 27. Interactive Location Picker with Map */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Real GPS Location Coordinates
          </h3>
          <p className="text-xs text-slate-500">
            Pin the exact entrance of your parking facility so drivers can navigate and verify their arrival accurately.
          </p>
          <LocationPicker
            initialLatitude={latitude}
            initialLongitude={longitude}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Capacity & Rates */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Capacity, Pricing & Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Slots Available *
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalSlots}
                onChange={(e) => setTotalSlots(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hourly Rate (₹/hr) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={pricePerHour}
                onChange={(e) => setPricePerHour(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Parking Type *
              </label>
              <select
                value={parkingType}
                onChange={(e) => setParkingType(e.target.value as ParkingType)}
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white"
              >
                <option value="Covered">Covered</option>
                <option value="Open">Open</option>
                <option value="Garage">Garage</option>
                <option value="Basement">Basement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CCTV Monitored?</label>
              <select
                value={cctvAvailable.toString()}
                onChange={(e) => setCctvAvailable(e.target.value === 'true')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gated Entry?</label>
              <select
                value={gateAvailable.toString()}
                onChange={(e) => setGateAvailable(e.target.value === 'true')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        {/* 23. Parking Photos Upload */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Parking Space Photos (Min 2, Max 6) *
          </h3>
          <p className="text-xs text-slate-500">
            Upload clear photographs showing the driveway entrance and designated slots ({photos.length} selected).
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            required
            onChange={handlePhotosChange}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:bg-slate-300"
        >
          {isSubmitting ? 'Publishing Parking Facility...' : 'Publish Parking Space to Live Map'}
        </button>
      </form>
    </div>
  );
};
