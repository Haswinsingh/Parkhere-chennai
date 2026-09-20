import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, ShieldCheck, Clock, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForDriversPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Driver Experience
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Reliable Parking at Your Fingertips
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Save time, fuel, and stress by securing real parking spaces before you set off.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Live Interactive Map</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            View available parking nearby in green, spaces running low in orange, and full lots in red. Get real distance and directions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Parking Facilities</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every parking space is owned by a verified host with checked government ID, confirmed entrance photos, and security features (CCTV, gates).
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Flexible Dynamic Payments</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pay upon completion using dynamic UPI QR codes or pay cash directly to the attendant with instant confirmation receipts.
          </p>
        </div>
      </div>

      <div className="bg-emerald-600 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to park smarter?</h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
          Create your driver account in under a minute, search nearby parking, and enjoy seamless urban mobility.
        </p>
        <Link
          to="/signup?role=parking_needed"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          Sign Up as Driver <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
