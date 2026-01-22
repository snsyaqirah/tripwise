import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Create a custom Axios instance for API calls
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('tripwise_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API function
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}

/*
 * BONUS / UPGRADE NOTES:
 * - Add retry logic with exponential backoff
 * - Add request caching for GET requests
 * - Add offline queue for failed requests (service worker integration)
 * - Add request deduplication
 * - Integration with external APIs:
 *   - Currency exchange rates API (e.g., exchangerate-api.com)
 *   - Maps API (Google Maps, Mapbox)
 *   - Destination info API (REST Countries, etc.)
 */
