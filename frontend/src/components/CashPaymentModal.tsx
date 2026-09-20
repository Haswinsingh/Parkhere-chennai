import React from 'react';
import { Booking, PaymentRecord } from '../types';
import { X, HandCoins, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CashPaymentModalProps {
  booking: Booking;
  payment: PaymentRecord;
  onClose: () => void;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({ booking, payment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Cash Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
            <span className="text-xs text-emerald-800 font-semibold block">Total Amount Due</span>
            <span className="text-4xl font-extrabold text-emerald-700">₹{payment.amount}</span>
            <span className="text-[11px] text-emerald-600 block">
              Reference: {payment.transactionReference}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Payment Instructions:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please pay <span className="font-bold text-slate-900">₹{payment.amount}</span> in cash directly to the parking holder or security attendant.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once you hand over the cash, the parking holder will click <span className="font-semibold text-emerald-700">"Confirm Cash Received"</span> on their dashboard to conclude your session.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Session ends automatically upon holder confirmation</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Understood, Paying Cash
          </button>
        </div>
      </div>
    </div>
  );
};
