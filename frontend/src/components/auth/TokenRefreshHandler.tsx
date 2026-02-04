import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

export function TokenRefreshHandler() {
  const { logout } = useAuth();

  useEffect(() => {
    // Intercept 401 responses and attempt token refresh
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh the token
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const { data } = await api.post('/api/auth/refresh', {
              refreshToken,
            });

            // Store new tokens
            localStorage.setItem('access_token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refresh_token', data.refreshToken);
            }

            // Update the authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token is invalid or expired, logout user
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // This component doesn't render anything
  return null;
}
