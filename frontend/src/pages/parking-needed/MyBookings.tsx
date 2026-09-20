import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { Booking, PaymentRecord } from '../../types';
import { ArrivalModal } from '../../components/ArrivalModal';
import { UpiPaymentModal } from '../../components/UpiPaymentModal';
import { CashPaymentModal } from '../../components/CashPaymentModal';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  Camera,
  Timer,
  Navigation,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'arrived' | 'active' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedBookingForArrival, setSelectedBookingForArrival] = useState<Booking | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<{
    booking: Booking;
    payment: PaymentRecord;
    qrCodeDataUrl?: string;
    method: 'upi' | 'cash';
  } | null>(null);

  // Live countdown timer state (ticks every second)
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings();
      if (res.success && res.data) {
        setBookings(res.data.bookings);
      }
    } catch (err: any) {
      setError('Failed to retrieve your bookings. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingService.cancel(bookingId, 'Driver cancelled before arrival');
      if (res.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleInitiatePayment = async (booking: Booking, method: 'upi' | 'cash') => {
    try {
      const res = await paymentService.createPayment({
        bookingId: booking.id,
        method,
      });

      if (res.success && res.data) {
        setSelectedBookingForPayment({
          booking,
          payment: res.data.payment,
          qrCodeDataUrl: res.data.qrCodeDataUrl,
          method,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unable to initiate payment.');
    }
  };

  // Filter bookings by tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full">Upcoming</span>;
      case 'arrived':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full">Arrived (Host Review)</span>;
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full animate-pulse">Session Active</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-full">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your reservations, check in on arrival, monitor parking timers, and settle payments.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'arrived', label: 'Arrived' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No bookings found</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'all'
              ? "You haven't reserved any parking spaces yet."
              : `No bookings currently under '${activeTab}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const parking = booking.parkingId as any;
            const endTimestamp = new Date(booking.parkingEndTime || booking.endTime).getTime();
            const remainingMs = endTimestamp - now;
            const isExpiringSoon = remainingMs > 0 && remainingMs <= 10 * 60 * 1000;
            const isOvertime = remainingMs <= 0;

            const formatCountdown = (ms: number) => {
              if (ms <= 0) return '00:00:00 (Session Concluded)';
              const totalSec = Math.floor(ms / 1000);
              const hrs = Math.floor(totalSec / 3600);
              const mins = Math.floor((totalSec % 3600) / 60);
              const secs = totalSec % 60;
              return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{parking?.name || 'Parking Space'}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {parking?.address}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-extrabold text-slate-900">₹{booking.totalAmount}</span>
                    <span className="text-[11px] text-slate-400 block -mt-1">
                      {booking.duration}h @ ₹{booking.pricePerHour}/h
                    </span>
                  </div>
                </div>

                {/* 39. ACTIVE PARKING LIVE TIMER (Backend-driven) */}
                {booking.status === 'active' && (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isExpiringSoon
                        ? 'bg-amber-50 border-amber-300'
                        : isOvertime
                        ? 'bg-red-50 border-red-300'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
                        <Timer className="w-4 h-4 text-emerald-600" />
                        Live Parking Session
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {formatCountdown(remainingMs)}
                      </span>
                    </div>

                    {isExpiringSoon && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 pt-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>10-Minute Warning: Your booked parking session is concluding soon!</span>
                      </div>
                    )}

                    {isOvertime && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-800 pt-1">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Session duration reached. Please conclude parking and proceed to payment.</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                      <span>Started: {new Date(booking.parkingStartTime || booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Ends: {new Date(booking.parkingEndTime || booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Booking Date</span>
                    <span className="font-semibold text-slate-700">{booking.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Start Time</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Payment Status</span>
                    <span
                      className={`font-bold capitalize ${
                        booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Booking ID</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block">
                      {booking.id.slice(-8)}
                    </span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  {/* Cancel Button (Upcoming only) */}
                  {booking.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* 34. I've Arrived Button */}
                  {booking.status === 'upcoming' && (
                    <button
                      onClick={() => setSelectedBookingForArrival(booking)}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      I've Arrived (Verify Vehicle)
                    </button>
                  )}

                  {/* Arrived status notification */}
                  {booking.status === 'arrived' && (
                    <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <Camera className="w-3.5 h-3.5" />
                      Arrival submitted. Awaiting Parking Holder approval...
                    </div>
                  )}

                  {/* Payment Buttons (when active or completed and pending payment) */}
                  {(booking.status === 'active' || booking.status === 'completed') &&
                    booking.paymentStatus === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInitiatePayment(booking, 'upi')}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay via UPI / GPay
                        </button>
                        <button
                          onClick={() => handleInitiatePayment(booking, 'cash')}
                          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Pay Cash to Holder
                        </button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Arrival Modal */}
      {selectedBookingForArrival && (
        <ArrivalModal
          booking={selectedBookingForArrival}
          onClose={() => setSelectedBookingForArrival(null)}
          onSuccess={() => {
            setSelectedBookingForArrival(null);
            fetchBookings();
          }}
        />
      )}

      {/* Dynamic UPI Payment Modal */}
      {selectedBookingForPayment && selectedBookingForPayment.method === 'upi' && (
        <UpiPaymentModal
          booking={selectedBookingForPayment.booking}
          payment={selectedBookingForPayment.payment}
          qrCodeDataUrl={selectedBookingForPayment.qrCodeDataUrl}
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            setSelectedBookingForPayment(null);
            fetchBookings();
          }}
        />
      )}

      {/* Cash Payment Modal */}
      {selectedBookingForPayment && selectedBookingForPayment.method === 'cash' && (
        <CashPaymentModal
          booking={selectedBookingForPayment.booking}
          payment={selectedBookingForPayment.payment}
          onClose={() => {
            setSelectedBookingForPayment(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
