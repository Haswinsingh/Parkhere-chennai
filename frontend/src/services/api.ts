import axios from 'axios';

// Ensure baseURL consistently resolves to an endpoint ending with /api
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // In production builds, default directly to the live production backend
  if ((import.meta as any).env?.PROD) {
    return 'https://parkhere-chennai.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to automatically add JWT Bearer token and strip duplicate /api prefix
api.interceptors.request.use(
  (config) => {
    // If request URL starts with /api/, strip it since baseURL already ends with /api
    if (config.url) {
      config.url = config.url.replace(/^\/?api\//, '/');
    }

    const token = localStorage.getItem('parkhere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clean error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not on login/signup page, remove stored token
      if (
        !window.location.pathname.includes('/signin') &&
        !window.location.pathname.includes('/signup')
      ) {
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
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}/api/media/${isPrivate ? 'private' : 'public'}/${filename}`;
};

