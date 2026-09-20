import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, DollarSign, ShieldCheck, CheckCircle2, ArrowRight, Eye, ToggleLeft } from 'lucide-react';

export const ForHoldersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Host Experience
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Turn Unused Parking into Steady Income
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          List your residential driveway, commercial lot, or basement slots on ParkHere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ToggleLeft className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Full Real-Time Control</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toggle your parking space Open or Closed at any moment. Adjust slot counts, update hourly pricing, and view active sessions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Vehicle Arrival Inspection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Review incoming driver photos, GPS proximity, and pre-existing vehicle damage declarations before approving their parking session.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Direct Earnings & Payouts</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Receive direct UPI payments to your registered UPI ID or collect cash on-site and confirm cash receipt directly from your dashboard.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to monetize your parking?</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Submit your host preferences and compulsory verification documents today. Our team approves accounts rapidly.
        </p>
        <Link
          to="/signup?role=parking_holder"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          Become a Parking Holder <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
