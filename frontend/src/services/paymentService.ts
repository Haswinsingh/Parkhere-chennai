import { api } from './api';
import { ApiResponse, Booking, PaymentRecord } from '../types';

export const paymentService = {
  async createPayment(payload: {
    bookingId: string;
    method: 'cash' | 'upi';
  }): Promise<
    ApiResponse<{
      payment: PaymentRecord;
      qrCodeDataUrl?: string;
      breakdown: {
        baseAmount: number;
        overtimeAmount: number;
        finalAmount: number;
        duration: number;
        pricePerHour: number;
      };
    }>
  > {
    const res = await api.post('/payments/create', payload);
    return res.data;
  },

  async confirmPayment(payload: {
    paymentId?: string;
    bookingId?: string;
    method: 'cash' | 'upi';
    upiTransactionRef?: string;
  }): Promise<ApiResponse<{ payment: PaymentRecord; booking: Booking }>> {
    const res = await api.post('/payments/confirm', payload);
    return res.data;
  },

  async getPaymentByBooking(bookingId: string): Promise<ApiResponse<{ payment: PaymentRecord }>> {
    const res = await api.get(`/payments/booking/${bookingId}`);
    return res.data;
  },
};
