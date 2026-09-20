import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(
    data: FormData | { [key: string]: any }
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/api/auth/register',
      data,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return res.data;
  },

  async login(payload: {
    identifier?: string;
    email?: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/api/auth/login',
      payload
    );
    return res.data;
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    const res = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return res.data;
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const res = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('parkhere_token');
      localStorage.removeItem('parkhere_user');
    }
  },
};

