import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { parkingService } from '../../services/parkingService';
import { NearbyParkingItem, ParkingSpace, Booking } from '../../types';
import { ParkingCard } from '../../components/ParkingCard';
import { BookingModal } from '../../components/BookingModal';
import {
  MapPin,
  CalendarCheck,
  Search,
  Navigation,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const ParkingNeededDashboard: React.FC = () => {
  const { user } = useAuth();
  const { coordinates, locationName, isLocating, requestDeviceLocation } = useLocation();
  const navigate = useNavigate();

  const [nearbyParking, setNearbyParking] = useState<NearbyParkingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedParkingForBooking, setSelectedParkingForBooking] = useState<ParkingSpace | null>(null);

  const fetchNearby = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const res = await parkingService.getNearby(lat, lng, user?.settings?.searchRadiusKm, user?.settings?.sortPreference);
      if (res.success && res.data) {
        setNearbyParking(res.data.results);
      }
    } catch {
      setNearbyParking([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (coordinates) {
      fetchNearby(coordinates.latitude, coordinates.longitude);
    }
  }, [coordinates, user?.settings?.searchRadiusKm, user?.settings?.sortPreference]);

  const handleBookingSuccess = (booking: Booking) => {
    setSelectedParkingForBooking(null);
    navigate('/parking-needed/bookings');
  };

  return (
    <div className="space-y-8">
      {/* 13. Top Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full">
            Driver Dashboard
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Find your next parking space quickly with real-time GPS location and live availability.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/parking-needed/find"
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Find Parking
            </Link>
            <Link
              to="/parking-needed/map"
              className="px-5 py-2.5 bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-emerald-500/40"
            >
              <MapPin className="w-4 h-4" /> Live Map
            </Link>
            <Link
              to="/parking-needed/bookings"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" /> My Bookings
            </Link>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <MapPin className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Current GPS Location Status Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Current Location Reference
            </span>
            <p className="text-xs font-bold text-slate-800">
              {isLocating ? 'Detecting high-accuracy GPS coordinates...' : locationName}
            </p>
          </div>
        </div>

        <button
          onClick={requestDeviceLocation}
          disabled={isLocating}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          {isLocating ? 'Acquiring GPS...' : 'Refresh Location'}
        </button>
      </div>

      {/* Nearby Parking Spaces List (Real DB results) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nearby Parking Spaces</h2>
            <p className="text-xs text-slate-500">
              Verified spaces within {user?.settings?.searchRadiusKm || 5} km
            </p>
          </div>
          <Link
            to="/parking-needed/map"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View Live Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Searching parking spaces nearby...</p>
          </div>
        ) : nearbyParking.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No parking spaces available nearby.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no open registered parking spaces in this area. You can search another landmark or area.
            </p>
            <Link
              to="/parking-needed/find"
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
            >
              Search Another Area
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyParking.map(({ parking, distanceMeters }) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                distanceMeters={distanceMeters}
                onBook={(p) => setSelectedParkingForBooking(p)}
                onViewDetails={(p) => setSelectedParkingForBooking(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Wizard Modal */}
      {selectedParkingForBooking && (
        <BookingModal
          parking={selectedParkingForBooking}
          onClose={() => setSelectedParkingForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
