import React from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Bell,
  Search,
  CheckCircle2,
  Navigation,
  Lock,
  Video,
  Smartphone,
  Server,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: 'Real-Time Parking Spaces',
      desc: 'Direct connection to a single shared MongoDB database. When a space is created, opened, or booked, the availability updates immediately.',
      icon: MapPin,
    },
    {
      title: 'Live Geolocation & Radius Query',
      desc: 'Browser Geolocation API with enableHighAccuracy for pinpoint user coordinates. Intelligent 5km to 10km radius expansion.',
      icon: Navigation,
    },
    {
      title: 'Smart Area & Landmark Search',
      desc: 'Forward and reverse geocoding via OpenStreetMap Nominatim. Search any city sector, landmark or street.',
      icon: Search,
    },
    {
      title: 'Atomic Slot Locking',
      desc: 'Concurrency-protected bookings. The backend verifies slots > 0 and decrements capacity atomically to eliminate overbooking.',
      icon: Lock,
    },
    {
      title: 'Compulsory Host Verification',
      desc: 'Government ID verification, landmark requirement, and minimum 2 parking photos required before any host is approved to publish spaces.',
      icon: ShieldCheck,
    },
    {
      title: '100m Arrival Geofencing',
      desc: 'Before arrival can be submitted, the server verifies that the driver device GPS is within 100 meters of the parking coordinates.',
      icon: Navigation,
    },
    {
      title: 'Vehicle Inspection & Evidence',
      desc: 'Capture parked vehicle photos and pre-existing damage declarations with photos, securely stored in protected private storage.',
      icon: Video,
    },
    {
      title: 'Dynamic UPI & Cash Payments',
      desc: 'Generates genuine dynamic UPI links with transaction references, amount encoding, and host cash payment receipt confirmations.',
      icon: CreditCard,
    },
    {
      title: 'In-App Notification Center',
      desc: 'Real-time notifications for booking confirmations, arrival requests, approvals, session reminders, and payment receipts.',
      icon: Bell,
    },
    {
      title: '10-Minute Expiry Alerts',
      desc: 'Backend scheduled job inspects active sessions every 30 seconds and dispatches timely warnings before duration expires.',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Platform Architecture & Features
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Built for scale, verified data integrity, and real-world urban parking operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-400 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
