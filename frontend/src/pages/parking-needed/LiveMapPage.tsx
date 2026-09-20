import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { parkingService } from '../../services/parkingService';
import { NearbyParkingItem, ParkingSpace, Booking } from '../../types';
import { LiveMap } from '../../components/map/LiveMap';
import { ParkingCard } from '../../components/ParkingCard';
import { SearchLocation } from '../../components/map/SearchLocation';
import { LocationButton } from '../../components/map/LocationButton';
import { BookingModal } from '../../components/BookingModal';
import { MapPin, RefreshCw, Radio, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveMapPage: React.FC = () => {
  const {
    activeLocation,
    coordinates,
    locationName,
    isLocating,
    isUsingDeviceLocation,
    isLiveTracking,
    toggleLiveTracking,
  } = useLocation();

  const navigate = useNavigate();
  const [parkingItems, setParkingItems] = useState<NearbyParkingItem[]>([]);
  const [selectedParking, setSelectedParking] = useState<ParkingSpace | null>(null);
  const [selectedParkingForBooking, setSelectedParkingForBooking] = useState<ParkingSpace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNearby = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const res = await parkingService.getNearby(lat, lng, 10); // 10km radius for map view
      if (res.success && res.data) {
        setParkingItems(res.data.results);
      }
    } catch {
      setParkingItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (coordinates) {
      fetchNearby(coordinates.latitude, coordinates.longitude);
    }
  }, [coordinates]);

  const handleBookingSuccess = (_booking: Booking) => {
    setSelectedParkingForBooking(null);
    navigate('/parking-needed/bookings');
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Location Control Strip */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="w-full md:w-96">
          <SearchLocation
            placeholder="Search area, landmark or street on map..."
            onLocationSelected={(loc) => {
              fetchNearby(loc.latitude, loc.longitude);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 justify-between md:justify-end text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate max-w-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-slate-800">{locationName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Movement Tracking Toggle */}
            <button
              type="button"
              onClick={toggleLiveTracking}
              className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border ${
                isLiveTracking
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Track physical movement in real-time"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isLiveTracking ? 'Tracking Live' : 'Track GPS'}</span>
            </button>

            <LocationButton
              onLocationObtained={(coords) => fetchNearby(coords.latitude, coords.longitude)}
              variant="secondary"
              showAccuracy={true}
            />
          </div>
        </div>
      </div>

      {/* Map Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="font-bold text-slate-700">Map Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200"></span> You are here
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available (&gt;3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Few Slots (1-3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Full / Closed
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-World High-Resolution Satellite View</span>
        </div>
      </div>

      {/* Two-Column Responsive Layout: Full Satellite Map + Spaces Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Satellite Map */}
        <div className="lg:col-span-8 h-[550px] sm:h-[650px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
          <LiveMap
            userLocation={activeLocation}
            parkingItems={parkingItems}
            selectedParking={selectedParking}
            onSelectParking={(p) => setSelectedParking(p)}
            onBookNow={(p) => setSelectedParkingForBooking(p)}
            className="w-full h-full"
            defaultStyle="satellite"
            zoom={15}
            showControls={true}
            showStyleToggle={true}
          />
        </div>

        {/* Side Panel: Spaces List */}
        <div className="lg:col-span-4 space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">
              Spaces Plotted ({parkingItems.length})
            </h3>
            {isLoading && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning...
              </span>
            )}
          </div>

          {parkingItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No parking locations in this view</p>
              <p className="text-[11px] text-slate-400">
                Click "Use My Location" or pan/search to find active parking spaces.
              </p>
            </div>
          ) : (
            parkingItems.map(({ parking, distanceMeters }) => (
              <div
                key={parking.id}
                onClick={() => setSelectedParking(parking)}
                className={`cursor-pointer transition-all rounded-2xl ${
                  selectedParking?.id === parking.id
                    ? 'ring-2 ring-emerald-500 shadow-lg'
                    : ''
                }`}
              >
                <ParkingCard
                  parking={parking}
                  distanceMeters={distanceMeters}
                  onBook={(p) => setSelectedParkingForBooking(p)}
                  onViewDetails={(p) => setSelectedParking(p)}
                />
              </div>
            ))
          )}
        </div>
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
