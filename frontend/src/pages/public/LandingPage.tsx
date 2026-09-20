import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Bell,
  Search,
  CheckCircle2,
  ArrowRight,
  Car,
  Building2,
  Navigation,
  Lock,
  Video,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* 5. LANDING HERO */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Next-Generation Urban Mobility
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Find Parking <span className="text-emerald-600">Easily</span>, Anywhere
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover available parking near you, check real-time availability, and book your space before you arrive.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/parking-needed/map"
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Find Parking
                </Link>

                <Link
                  to="/signup?role=parking_holder"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 hover:border-slate-400 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Become a Parking Holder
                </Link>
              </div>

              {/* Verified Features mini pill row */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Slots
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100m GPS Arrival
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dynamic UPI / Cash
                </span>
              </div>
            </div>

            {/* Right Visual: Premium City Parking Environment Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-3xl p-4 shadow-2xl border border-slate-200">
                {/* Visual Map Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Live Geospatial Network</span>
                </div>

                {/* Map Graphic Box */}
                <div className="h-56 bg-slate-100 rounded-2xl relative overflow-hidden my-3 border border-slate-200 flex items-center justify-center">
                  {/* Grid Roads */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                  {/* Device GPS Pulse */}
                  <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-200 animate-pulse"></div>
                    <span className="mt-1 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold shadow">
                      You
                    </span>
                  </div>

                  {/* Parking Markers */}
                  <div className="absolute top-6 right-8 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <span>5P</span>
                    <span className="text-[10px] opacity-80">₹40/h</span>
                  </div>

                  <div className="absolute bottom-8 right-12 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <span>12P</span>
                    <span className="text-[10px] opacity-80">₹30/h</span>
                  </div>

                  <div className="absolute bottom-6 left-8 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                    2P Few
                  </div>
                </div>

                {/* Floating Preview Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Commercial Parking Facility</h4>
                      <p className="text-[11px] text-slate-500">250m away • Verified Host</p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">₹40/hr</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="text-emerald-700 font-semibold">● 5 Slots Available</span>
                    <span className="flex items-center gap-0.5"><Video className="w-3 h-3 text-emerald-600" /> CCTV</span>
                    <span className="flex items-center gap-0.5"><Lock className="w-3 h-3 text-emerald-600" /> Gated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (01 Find, 02 Book, 03 Arrive, 04 Park & Pay) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
            Seamless Mobility
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Four simple steps from finding an open space to secure payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 01 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
            <span className="text-3xl font-extrabold text-emerald-100 group-hover:text-emerald-200 transition-colors">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 my-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Find</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find parking near your destination with real-time GPS search and live map markers.
            </p>
          </div>

          {/* Step 02 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
            <span className="text-3xl font-extrabold text-emerald-100 group-hover:text-emerald-200 transition-colors">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 my-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Book</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reserve an available parking space with atomic slot locking and upfront duration selection.
            </p>
          </div>

          {/* Step 03 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
            <span className="text-3xl font-extrabold text-emerald-100 group-hover:text-emerald-200 transition-colors">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 my-3">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Arrive</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reach the parking location within 100 meters, upload your vehicle inspection photo, and check in.
            </p>
          </div>

          {/* Step 04 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
            <span className="text-3xl font-extrabold text-emerald-100 group-hover:text-emerald-200 transition-colors">
              04
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 my-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Park & Pay</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Park for your booked duration, receive a 10-minute warning alert, and pay securely via UPI or Cash.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FEATURES */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Technology Stack
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Features
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Engineered for genuine reliability, security, and real-time accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Real-Time Parking', desc: 'True database-driven parking states.' },
              { title: 'Live Location', desc: 'High accuracy device GPS navigation.' },
              { title: 'Smart Search', desc: 'Geospatial radius queries with auto-expand.' },
              { title: 'Secure Booking', desc: 'Atomic slot reservation prevents conflicts.' },
              { title: 'Verified Parking Holders', desc: 'Compulsory government ID & host approval.' },
              { title: 'Slot Availability', desc: 'Dynamic slot counters updated in real time.' },
              { title: 'Vehicle Verification', desc: 'Geo-tagged vehicle photo & damage inspection.' },
              { title: 'Digital Payment', desc: 'Dynamic UPI QR codes and Cash receipt flows.' },
              { title: 'Booking Notifications', desc: 'In-app real-time event updates.' },
              { title: '10-Minute Expiry Alerts', desc: 'Backend scheduled expiration warnings.' },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 hover:border-emerald-300 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2"></div>
                <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                <p className="text-[11px] text-slate-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Audiences CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">Need Parking?</h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Stop circling the block. Search for open parking spots, book ahead, and drive straight into your guaranteed space.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/signup?role=parking_needed"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Sign Up as Driver <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">Own Parking Space?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Monetize your vacant driveway, residential lot, or commercial garage. Verified drivers, direct UPI payouts, and full control.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/signup?role=parking_holder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                List Your Parking <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
