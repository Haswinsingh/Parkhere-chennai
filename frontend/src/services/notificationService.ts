import { api } from './api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>> {
    const res = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<ApiResponse> {
    const res = await api.patch<ApiResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<ApiResponse> {
    const res = await api.post<ApiResponse>('/notifications/mark-all-read');
    return res.data;
  },
};
