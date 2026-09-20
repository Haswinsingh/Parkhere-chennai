import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  HandCoins,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const EarningsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingService.getBookings();
        if (res.success && res.data) {
          setBookings(res.data.bookings);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const upiRevenue = paidBookings
    .filter((b) => b.paymentMethod === 'upi')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const cashRevenue = paidBookings
    .filter((b) => b.paymentMethod === 'cash')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Earnings & Payouts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your gross parking earnings, UPI payouts, and verified cash collections.
        </p>
      </div>

      {/* Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Total Realized Revenue
            </span>
            <DollarSign className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-extrabold">₹{totalRevenue}</p>
          <p className="text-[11px] text-emerald-100">{paidBookings.length} completed transactions</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Dynamic UPI Receipts</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">₹{upiRevenue}</p>
          <p className="text-[11px] text-slate-400">Direct instant UPI bank transfers</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cash Collected</span>
            <HandCoins className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">₹{cashRevenue}</p>
          <p className="text-[11px] text-slate-400">Physical cash confirmed at gate</p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Completed Transactions</h3>

        {paidBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No completed paid bookings yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600">{b.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{(b.userId as any)?.name}</td>
                    <td className="py-3 px-3 text-slate-600">{(b.parkingId as any)?.name}</td>
                    <td className="py-3 px-3 text-slate-600">{b.duration} hrs</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      ₹{b.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
