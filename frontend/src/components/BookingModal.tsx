import React, { useState } from 'react';
import { ParkingSpace, Booking } from '../types';
import { bookingService } from '../services/bookingService';
import { X, Calendar, Clock, DollarSign, ShieldCheck, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  parking: ParkingSpace | null;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ parking, onClose, onSuccess }) => {
  if (!parking) return null;

  // Default date: today in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  // Default start time: current time rounded to next 15 minutes
  const now = new Date();
  const nextHour = new Date(now.getTime() + 15 * 60 * 1000);
  const defaultStartTime = `${nextHour.toISOString().split('T')[0]}T${nextHour.toTimeString().slice(0, 5)}`;

  const [date, setDate] = useState<string>(today);
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [duration, setDuration] = useState<number>(2); // Default 2 hours
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pricePerHour = parking.pricePerHour;
  const calculatedTotal = Math.round(pricePerHour * duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await bookingService.create({
        parkingId: parking.id,
        date,
        startTime: new Date(startTime).toISOString(),
        duration,
      });

      if (res.success && res.data?.booking) {
        onSuccess(res.data.booking);
      } else {
        setError(res.message || 'Failed to complete booking reservation.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book slot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Book Parking Space</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{parking.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing & Location Summary Box */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-900">Hourly Parking Rate</span>
              <span className="font-extrabold text-emerald-700 text-base">₹{pricePerHour}/hr</span>
            </div>
            <p className="text-xs text-emerald-800">
              <span className="font-semibold">Address:</span> {parking.address}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Parking Space • {parking.availableSlots} slots remaining
            </div>
          </div>

          {/* Booking Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Booking Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estimated Arrival Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Parking Duration (Hours)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1, 2, 3, 4].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setDuration(hrs)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    duration === hrs
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-700 w-16 text-right">
                {duration} hrs
              </span>
            </div>
          </div>

          {/* Price Calculation Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Parking Rate ({pricePerHour} × {duration} hrs)</span>
              <span>₹{calculatedTotal}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Platform Service Fee</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900">Total Payable Amount</span>
              <span className="font-extrabold text-lg text-emerald-600">₹{calculatedTotal}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Payment is made upon session completion via Cash or dynamic UPI.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300"
          >
            {isSubmitting ? 'Confirming Reservation...' : `Confirm & Reserve Slot (₹${calculatedTotal})`}
          </button>
        </form>
      </div>
    </div>
  );
};
