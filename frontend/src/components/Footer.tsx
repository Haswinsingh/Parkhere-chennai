import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Smartphone, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">ParkHere</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Parking for Smarter Cities. Connecting drivers with verified parking spaces in real-time.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Parking Network
            </div>
          </div>

          {/* For Drivers */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">For Drivers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/for-drivers" className="hover:text-emerald-400 transition-colors">Find Nearby Parking</Link></li>
              <li><Link to="/parking-needed/map" className="hover:text-emerald-400 transition-colors">Live Availability Map</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">Vehicle Arrival Verification</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">UPI & Cash Payments</Link></li>
            </ul>
          </div>

          {/* For Parking Holders */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">For Parking Holders</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/for-holders" className="hover:text-emerald-400 transition-colors">List Your Parking Space</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">Host Verification Process</Link></li>
              <li><Link to="/for-holders" className="hover:text-emerald-400 transition-colors">Slot & Rate Management</Link></li>
              <li><Link to="/for-holders" className="hover:text-emerald-400 transition-colors">Direct Payouts</Link></li>
            </ul>
          </div>

          {/* Platform Trust & Legal */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About ParkHere</Link></li>
              <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Security & Privacy</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><span className="text-slate-500">v1.0.0 Production Release</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ParkHere Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Real GPS Geospatial Engine</span>
            <span>Zero Mock Data</span>
            <span>Real Dynamic UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
