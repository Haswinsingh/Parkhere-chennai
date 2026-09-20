import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { Booking } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  CheckCircle2,
  HandCoins,
  ShieldCheck,
  AlertCircle,
  Timer,
} from 'lucide-react';

export const HolderBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'arrived' | 'active' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings();
      if (res.success && res.data) {
        setBookings(res.data.bookings);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCashReceived = async (bookingId: string) => {
    if (!window.confirm('Confirm that you have received the exact cash payment from this driver?')) return;
    setConfirmingBookingId(bookingId);
    try {
      const res = await paymentService.confirmPayment({
        bookingId,
        method: 'cash',
      });
      if (res.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm cash receipt.');
    } finally {
      setConfirmingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facility Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review upcoming driver arrivals, active parking sessions, and confirm cash collections.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'arrived', label: 'Arrived' },
            { id: 'upcoming', label: 'Upcoming' },
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
          <p className="text-xs font-medium">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No bookings in this category</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'all'
              ? 'No drivers have booked your spaces yet.'
              : `No bookings found with status '${activeTab}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const driver = booking.userId as any;
            const parking = booking.parkingId as any;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{driver?.name}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Phone: {driver?.phone}</span>
                      <span>•</span>
                      <span>Space: {parking?.name}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-extrabold text-emerald-600">₹{booking.totalAmount}</span>
                    <span className="text-[11px] text-slate-400 block -mt-1">
                      {booking.duration}h @ ₹{booking.pricePerHour}/h
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Booking Date</span>
                    <span className="font-semibold text-slate-700">{booking.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Start / End Time</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Payment Status</span>
                    <span
                      className={`font-bold capitalize ${
                        booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {booking.paymentStatus} ({booking.paymentMethod || 'Pending'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Booking ID</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block">
                      {booking.id.slice(-8)}
                    </span>
                  </div>
                </div>

                {/* 43. CASH PAYMENT CONFIRMATION BUTTON */}
                {booking.paymentStatus === 'pending' && booking.paymentMethod === 'cash' && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-900">
                      <HandCoins className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">Driver selected Cash Payment of ₹{booking.totalAmount}</p>
                        <p className="text-[11px] text-emerald-700">
                          Click below only after physically receiving the cash.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmCashReceived(booking.id)}
                      disabled={confirmingBookingId === booking.id}
                      className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                    >
                      {confirmingBookingId === booking.id ? 'Confirming...' : 'Confirm Cash Received'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
