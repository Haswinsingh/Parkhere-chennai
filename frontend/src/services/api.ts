import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to automatically add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkhere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clean error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not on login page, remove stored token
      if (!window.location.pathname.includes('/signin') && !window.location.pathname.includes('/signup')) {
        localStorage.removeItem('parkhere_token');
        localStorage.removeItem('parkhere_user');
      }
    }
    return Promise.reject(error);
  }
);

export const getMediaUrl = (filename: string, isPrivate = false): string => {
  if (!filename) return '';
  if (filename.startsWith('http') || filename.startsWith('blob:')) return filename;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}/api/media/${isPrivate ? 'private' : 'public'}/${filename}`;
};
