import { api } from './api';
import { ApiResponse, NearbyParkingItem, ParkingSpace } from '../types';

export const parkingService = {
  async getNearby(
    lat: number,
    lng: number,
    radiusKm?: number,
    sort?: string
  ): Promise<ApiResponse<{ results: NearbyParkingItem[]; count: number }>> {
    const params: any = { lat, lng };
    if (radiusKm) params.radius = radiusKm;
    if (sort) params.sort = sort;

    const res = await api.get<ApiResponse<{ results: NearbyParkingItem[]; count: number }>>(
      '/parking/nearby',
      { params }
    );
    return res.data;
  },

  async getMySpaces(): Promise<ApiResponse<{ parkingSpaces: ParkingSpace[] }>> {
    const res = await api.get<ApiResponse<{ parkingSpaces: ParkingSpace[] }>>('/parking/my-spaces');
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<{ parking: ParkingSpace }>> {
    const res = await api.get<ApiResponse<{ parking: ParkingSpace }>>(`/parking/${id}`);
    return res.data;
  },

  async create(formData: FormData): Promise<ApiResponse<{ parking: ParkingSpace }>> {
    const res = await api.post<ApiResponse<{ parking: ParkingSpace }>>('/parking', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async update(id: string, payload: Partial<ParkingSpace>): Promise<ApiResponse<{ parking: ParkingSpace }>> {
    const res = await api.patch<ApiResponse<{ parking: ParkingSpace }>>(`/parking/${id}`, payload);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/parking/${id}`);
    return res.data;
  },
};
