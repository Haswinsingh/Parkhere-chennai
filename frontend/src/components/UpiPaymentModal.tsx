import React, { useState } from 'react';
import { Booking, PaymentRecord } from '../types';
import { paymentService } from '../services/paymentService';
import { X, QrCode, CheckCircle2, AlertCircle, Smartphone, ArrowRight } from 'lucide-react';

interface UpiPaymentModalProps {
  booking: Booking;
  payment: PaymentRecord;
  qrCodeDataUrl?: string;
  onClose: () => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  booking,
  payment,
  qrCodeDataUrl,
  onClose,
  onSuccess,
}) => {
  const [upiRef, setUpiRef] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiRef.trim()) {
      setError('Please enter your 12-digit UPI reference number or transaction ID.');
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const res = await paymentService.confirmPayment({
        paymentId: payment.id,
        bookingId: booking.id,
        method: 'upi',
        upiTransactionRef: upiRef.trim(),
      });

      if (res.success && res.data?.booking) {
        onSuccess(res.data.booking);
      } else {
        setError(res.message || 'Payment confirmation could not be verified.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setIsConfirming(false);
    }
  };

  const upiUri = payment.upiDetails?.upiUri || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-slate-900">Dynamic UPI Payment</h3>
            <p className="text-xs text-slate-500">Scan QR Code or Open UPI App</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-center">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Box */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-800 font-medium block">Total Payable Amount</span>
            <span className="text-3xl font-extrabold text-emerald-700">₹{payment.amount}</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              Ref: {payment.transactionReference}
            </span>
          </div>

          {/* Dynamic QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Dynamic UPI QR Code"
                className="w-52 h-52 rounded-xl shadow-sm border border-slate-200 bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                <QrCode className="w-16 h-16" />
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Pay to: <span className="font-semibold text-slate-800">{payment.upiDetails?.payeeUpiId}</span>
            </p>
          </div>

          {/* Direct Pay Link for Mobile */}
          {upiUri && (
            <a
              href={upiUri}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Open In Any UPI App (GPay / PhonePe / Paytm)
            </a>
          )}

          {/* Confirmation Form */}
          <form onSubmit={handleConfirm} className="text-left space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700">
              UPI Reference ID / UTR (After completing payment)
            </label>
            <input
              type="text"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              placeholder="e.g. 423981293812"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-[10px] text-slate-400">
              Payment is marked verified upon submitting the real banking transaction reference.
            </p>

            <button
              type="submit"
              disabled={isConfirming}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:bg-slate-300"
            >
              {isConfirming ? 'Verifying Transaction...' : 'Confirm UPI Payment Completed'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
