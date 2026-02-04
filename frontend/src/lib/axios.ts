import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Create a custom Axios instance for API calls
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
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
      // Debug: log token info (first/last 10 chars only for security)
      console.log('Auth token:', token.substring(0, 10) + '...' + token.substring(token.length - 10));
    } else {
      console.warn('No auth token found in localStorage');
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
      console.warn('Unauthorized (401) - clearing token and redirecting to login');
      localStorage.removeItem('tripwise_token');
      localStorage.removeItem('tripwise_refresh_token');
      window.location.href = '/login';
    }
    // Log other errors for debugging
    if (error.response?.status === 404) {
      const errorData = error.response?.data as any;
      if (errorData?.message?.includes('User not found')) {
        console.error('⚠️ User not found error - Your session token is outdated. Please log out and log in again.');
      }
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
