import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Navigation, CreditCard, ShieldCheck, ArrowRight, Video, Camera } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How ParkHere Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From finding an available slot on the live map to completing payment, ParkHere connects drivers and property owners through a verified, transparent workflow.
        </p>
      </div>

      <div className="space-y-12">
        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Step 01
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Find Parking Nearby</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use your browser's real GPS location or type an area/landmark to perform a geospatial radius search. The system searches within 5 km, automatically expanding to 10 km if needed. You only see open, verified spaces with genuine slot counts.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <Search className="w-4 h-4" /> Live Geospatial Database Search
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block mb-2">Search Logic Features:</span>
            <p className="text-slate-600">• High accuracy device coordinates</p>
            <p className="text-slate-600">• Reverse geocoding to human-readable areas</p>
            <p className="text-slate-600">• Sorted by distance, price, or rating</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Step 02
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Reserve an Available Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your date, start time, and estimated duration. The backend performs an atomic check against current availability to eliminate overbooking. The slot is reserved for you.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <Clock className="w-4 h-4" /> Atomic Concurrency Protection
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block mb-2">Reservation Guarantee:</span>
            <p className="text-slate-600">• Real-time slot decrement</p>
            <p className="text-slate-600">• Upfront rate calculation</p>
            <p className="text-slate-600">• Instant in-app notification to host</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Step 03
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Arrive & Verify Vehicle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you reach the parking space, tap "I've Arrived". The server validates that your GPS is within 100 meters of the parking location. Upload a photo of your parked vehicle and declare any pre-existing scratches or damage. The host approves your arrival to start your timer.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <Camera className="w-4 h-4" /> 100m Geofence & Inspection Photos
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block mb-2">Inspection Security:</span>
            <p className="text-slate-600">• Vehicle photo stored privately</p>
            <p className="text-slate-600">• Pre-existing damage photo documentation</p>
            <p className="text-slate-600">• Host reviews and confirms before parking timer starts</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Step 04
            </span>
            <h3 className="text-2xl font-bold text-slate-900">10-Min Alert, Session End & Payment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exactly 10 minutes before your booked time expires, both you and the host receive an alert. When the session ends, pay via dynamic UPI QR code or Cash directly to the host.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <CreditCard className="w-4 h-4" /> Dynamic UPI / Cash Confirmation
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block mb-2">Payment Integrity:</span>
            <p className="text-slate-600">• Server-computed overtime calculation</p>
            <p className="text-slate-600">• Dynamic UPI URI encoded with exact amount</p>
            <p className="text-slate-600">• Host "Cash Received" confirmation</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          Get Started with ParkHere <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
