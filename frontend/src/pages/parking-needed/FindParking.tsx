import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { parkingService } from '../../services/parkingService';
import { NearbyParkingItem, ParkingSpace, Booking } from '../../types';
import { ParkingCard } from '../../components/ParkingCard';
import { LiveMap } from '../../components/map/LiveMap';
import { LocationButton } from '../../components/map/LocationButton';
import { BookingModal } from '../../components/BookingModal';
import { Search, MapPin, SlidersHorizontal, AlertCircle, LayoutGrid, Map as MapIcon, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FindParkingPage: React.FC = () => {
  const {
    activeLocation,
    coordinates,
    locationName,
    isLocating,
    isUsingDeviceLocation,
    requestDeviceLocation,
    searchAndSetLocation,
  } = useLocation();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<NearbyParkingItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<'distance' | 'price' | 'rating' | 'availability'>('distance');
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'both' | 'grid' | 'map'>('both');
  const [selectedParkingForBooking, setSelectedParkingForBooking] = useState<ParkingSpace | null>(null);

  // Suggested category filters
  const SUGGESTED_AREAS = ['Airport', 'Metro Station', 'City Center', 'Shopping Mall', 'Central Plaza', 'Railway Station'];

  const executeParkingSearch = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const res = await parkingService.getNearby(lat, lng, selectedRadius, selectedSort);
      if (res.success && res.data) {
        setResults(res.data.results);
      }
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (coordinates) {
      executeParkingSearch(coordinates.latitude, coordinates.longitude);
    }
  }, [coordinates, selectedSort, selectedRadius]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const coords = await searchAndSetLocation(searchQuery);
    if (coords) {
      executeParkingSearch(coords.latitude, coords.longitude);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchQuery(suggestion);
    const coords = await searchAndSetLocation(suggestion);
    if (coords) {
      executeParkingSearch(coords.latitude, coords.longitude);
    }
  };

  const handleBookingSuccess = (_booking: Booking) => {
    setSelectedParkingForBooking(null);
    navigate('/parking-needed/bookings');
  };

  return (
    <div className="space-y-6">
      {/* Search Header & Geolocation Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Parking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-world satellite tracking and live parking slot availability.
            </p>
          </div>

          {/* View Mode Toggle (Map / Grid / Split) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3 h-3" /> Map Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> Grid Only
            </button>
          </div>
        </div>

        {/* Search Input and Action Buttons */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search an area, landmark or street (e.g. Metro Station, Central Plaza)"
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching || isLocating}
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>

            <LocationButton
              onLocationObtained={(coords) => {
                setSearchQuery('');
                executeParkingSearch(coords.latitude, coords.longitude);
              }}
              variant="secondary"
              showAccuracy={true}
            />
          </div>
        </form>

        {/* Suggested Quick Searches */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Popular:</span>
          {SUGGESTED_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => handleSuggestionClick(area)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              {area}
            </button>
          ))}
        </div>

        {/* Active Location & Filter Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate max-w-md">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800 shrink-0">
              {isUsingDeviceLocation ? '📍 Device GPS:' : 'Searching Near:'}
            </span>
            <span className="text-slate-700 truncate">{locationName}</span>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(parseInt(e.target.value, 10))}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none"
              >
                <option value={1}>1 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none"
              >
                <option value="distance">Distance</option>
                <option value="price">Price (Low to High)</option>
                <option value="rating">Rating</option>
                <option value="availability">Slots Available</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Split / Map / Grid */}
      <div className="space-y-6">
        {/* Real-World Live Satellite Map */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                🛰️ Live Satellite Map View
              </span>
              <span className="text-xs text-slate-500">
                {results.length} spaces plotted
              </span>
            </div>

            <div className="h-[420px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <LiveMap
                userLocation={activeLocation}
                parkingItems={results}
                onSelectParking={(p) => setSelectedParkingForBooking(p)}
                onBookNow={(p) => setSelectedParkingForBooking(p)}
                className="w-full h-full"
                defaultStyle="satellite"
                zoom={14}
              />
            </div>
          </div>
        )}

        {/* Results List / Grid */}
        {(viewMode === 'both' || viewMode === 'grid') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Available Spaces ({results.length})
              </h2>
              {isSearching && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
                </span>
              )}
            </div>

            {isSearching ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-medium">Scanning live satellite radius for verified spaces...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No parking spaces available nearby.</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No active spaces found within {selectedRadius} km. Click "Use My Location" or search a different area.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(({ parking, distanceMeters }) => (
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
        )}
      </div>

      {/* Booking Modal */}
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
