import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
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

// --- Token refresh queue ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// Response interceptor - auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('tripwise_refresh_token');

      if (!refreshToken) {
        // No refresh token at all — force logout
        localStorage.removeItem('tripwise_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh finishes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const newToken = response.data.accessToken;
        localStorage.setItem('tripwise_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('tripwise_token');
        localStorage.removeItem('tripwise_refresh_token');
        localStorage.removeItem('tripwise_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}
