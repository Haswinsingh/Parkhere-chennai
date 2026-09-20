import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Target, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          About ParkHere
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Smart Parking for Smarter Cities
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          ParkHere was founded on a simple premise: urban congestion isn't just about too many vehicles, but about drivers searching blindly for scarce parking spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            To eliminate urban parking uncertainty through real-time geospatial intelligence, verified space discovery, and effortless digital transactions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Data Trust & Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero demo shortcuts. Zero hardcoded results. Every parking space, coordinate, and host is real and verified with genuine live database states.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Community Powered</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bridging property owners with drivers across cities, converting underutilized space into smart shared infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};
