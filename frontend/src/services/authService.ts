import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(formData: FormData): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async login(payload: { identifier: string; password: string; role?: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', payload);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('parkhere_token');
      localStorage.removeItem('parkhere_user');
    }
  },
};
