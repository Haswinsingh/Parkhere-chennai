import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parkingService } from '../../services/parkingService';
import { bookingService } from '../../services/bookingService';
import { ParkingSpace, Booking } from '../../types';
import { api, getMediaUrl } from '../../services/api';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Navigation,
  AlertTriangle,
  Camera,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

export const ParkingHolderDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingArrivalId, setProcessingArrivalId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [spacesRes, bookingsRes] = await Promise.all([
        parkingService.getMySpaces(),
        bookingService.getBookings(),
      ]);

      if (spacesRes.success && spacesRes.data) {
        setSpaces(spacesRes.data.parkingSpaces);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      console.error('Error loading host dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyArrival = async (bookingId: string, action: 'approve' | 'reject') => {
    setProcessingArrivalId(bookingId);
    try {
      const res = await bookingService.verifyArrival(bookingId, action);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update arrival verification.');
    } finally {
      setProcessingArrivalId(null);
    }
  };

  // Filter pending arrivals
  const pendingArrivals = bookings.filter((b) => b.status === 'arrived');
  const activeBookings = bookings.filter((b) => b.status === 'active');
  const totalSlots = spaces.reduce((acc, s) => acc + s.totalSlots, 0);
  const availableSlots = spaces.reduce((acc, s) => acc + s.availableSlots, 0);

  const verificationStatus = user?.verificationStatus || 'pending';

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Host Command Center
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                verificationStatus === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : verificationStatus === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              Verification: {verificationStatus}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {user?.name}'s Parking Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Monitor real-time driver arrivals, manage available parking slots, and verify cash and UPI payments.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/parking-holder/parking/new"
              className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ${
                verificationStatus === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Add Parking Space
            </Link>

            <Link
              to="/parking-holder/parking"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Manage Slots ({availableSlots}/{totalSlots})
            </Link>

            <Link
              to="/parking-holder/verification"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verification Status
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Warning Alert if not approved */}
      {verificationStatus !== 'approved' && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-3 ${
            verificationStatus === 'pending'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {verificationStatus === 'pending' ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-2 flex-1">
            <h4 className="font-bold text-sm">
              {verificationStatus === 'pending'
                ? 'Host Account Verification in Progress'
                : 'Host Verification Update Required'}
            </h4>
            <p className="leading-relaxed">
              {verificationStatus === 'pending'
                ? 'Your government ID and parking photos are under review. Once approved, your parking spaces will automatically appear on the Live Map for drivers.'
                : `Your verification submission was not approved: ${user?.verificationNotes || 'Please review your documents and resubmit.'}`}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.post('/verification/verify-me');
                    await refreshUser();
                    fetchData();
                  } catch (err: any) {
                    alert('Verification error.');
                  }
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Verify Host Account Now
              </button>
              <Link
                to="/parking-holder/verification"
                className="font-bold text-emerald-700 underline"
              >
                Check Verification Details →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spaces</span>
          <p className="text-2xl font-extrabold text-slate-900">{spaces.length}</p>
          <span className="text-[11px] text-slate-500">Published Facilities</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slots Available</span>
          <p className="text-2xl font-extrabold text-emerald-600">{availableSlots} / {totalSlots}</p>
          <span className="text-[11px] text-slate-500">Real-time open capacity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Arrivals</span>
          <p className={`text-2xl font-extrabold ${pendingArrivals.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
            {pendingArrivals.length}
          </p>
          <span className="text-[11px] text-slate-500">Drivers at gate awaiting approval</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sessions</span>
          <p className="text-2xl font-extrabold text-blue-600">{activeBookings.length}</p>
          <span className="text-[11px] text-slate-500">Parked vehicles currently timer-active</span>
        </div>
      </div>

      {/* 37. PARKING HOLDER ARRIVAL VERIFICATION PANEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Incoming Driver Arrival Verifications ({pendingArrivals.length})
            </h2>
            <p className="text-xs text-slate-500">
              Inspect vehicle photos, GPS proximity, and pre-existing damage evidence before approving entry.
            </p>
          </div>
        </div>

        {pendingArrivals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            No drivers are currently waiting at the gate for arrival approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingArrivals.map((booking) => {
              const driver = booking.userId as any;
              const parking = booking.parkingId as any;
              const arrival = booking.arrivalDetails;
              const vehiclePhotoUrl = arrival?.vehiclePhoto
                ? getMediaUrl(arrival.vehiclePhoto, true)
                : '';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border-2 border-emerald-400 p-5 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Driver At Gate
                      </span>
                      <h4 className="font-bold text-base text-slate-900 mt-1">{driver?.name}</h4>
                      <p className="text-xs text-slate-500">Phone: {driver?.phone}</p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-800">{parking?.name}</span>
                      <span className="text-[11px] text-slate-400 block">Duration: {booking.duration} hrs</span>
                    </div>
                  </div>

                  {/* Vehicle Inspection Photo */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Vehicle Verification Photo:
                    </span>
                    {vehiclePhotoUrl ? (
                      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={vehiclePhotoUrl}
                          alt="Parked Vehicle"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded">
                          GPS Proximity: {arrival?.distanceMeters}m from entrance
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No photo attached</p>
                    )}
                  </div>

                  {/* Damage Evidence Box */}
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      arrival?.damageReported
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-bold block">
                      Pre-existing Vehicle Damage Declaration:
                    </span>
                    {arrival?.damageReported ? (
                      <>
                        <p className="font-semibold text-amber-800">
                          Driver reported existing damage:
                        </p>
                        <p className="text-[11px]">{arrival.damageDescription || 'Photos attached below'}</p>
                        {arrival.damagePhotos && arrival.damagePhotos.length > 0 && (
                          <div className="flex gap-2 pt-1">
                            {arrival.damagePhotos.map((photo, i) => (
                              <img
                                key={i}
                                src={getMediaUrl(photo, true)}
                                alt={`Damage evidence ${i + 1}`}
                                className="w-12 h-12 rounded-lg object-cover border border-amber-300"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Driver declared NO pre-existing scratches or damage.
                      </p>
                    )}
                  </div>

                  {/* Verification Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleVerifyArrival(booking.id, 'reject')}
                      disabled={processingArrivalId === booking.id}
                      className="flex-1 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                    >
                      Reject Arrival
                    </button>
                    <button
                      onClick={() => handleVerifyArrival(booking.id, 'approve')}
                      disabled={processingArrivalId === booking.id}
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Start Timer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
