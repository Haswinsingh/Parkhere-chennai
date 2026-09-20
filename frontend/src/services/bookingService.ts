import { api } from './api';
import { ApiResponse, Booking } from '../types';

export const bookingService = {
  async create(payload: {
    parkingId: string;
    date: string;
    startTime: string;
    duration: number;
  }): Promise<ApiResponse<{ booking: Booking }>> {
    const res = await api.post<ApiResponse<{ booking: Booking }>>('/bookings', payload);
    return res.data;
  },

  async getBookings(status?: string): Promise<ApiResponse<{ bookings: Booking[] }>> {
    const params: any = {};
    if (status) params.status = status;
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings', { params });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<{ booking: Booking }>> {
    const res = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`);
    return res.data;
  },

  async cancel(id: string, reason?: string): Promise<ApiResponse<{ booking: Booking }>> {
    const res = await api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async submitArrival(id: string, formData: FormData): Promise<ApiResponse<{ booking: Booking; distanceMeters: number }>> {
    const res = await api.post<ApiResponse<{ booking: Booking; distanceMeters: number }>>(
      `/bookings/${id}/arrival`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async verifyArrival(
    id: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): Promise<ApiResponse<{ booking: Booking }>> {
    const res = await api.post<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/verify-arrival`, {
      action,
      rejectionReason,
    });
    return res.data;
  },
};
