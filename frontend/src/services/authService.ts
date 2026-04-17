import { api } from '@/lib/axios';
import { User } from '@/types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export const authService = {
  // ── Email signup (3 steps) ────────────────────────────────────────────────

  async initiateSignup(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/initiate-signup', { email });
    return response.data;
  },

  async verifyEmail(
    email: string,
    code: string,
    purpose: 'signup' | 'forgot_password'
  ): Promise<{ verificationToken: string; message: string }> {
    const response = await api.post('/auth/verify-email', { email, code, purpose });
    return response.data;
  },

  async completeSignup(
    verificationToken: string,
    name: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post('/auth/complete-signup', {
      verificationToken,
      name,
      password,
    });
    return response.data;
  },

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  // ── Forgot password (3 steps) ─────────────────────────────────────────────

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(
    email: string,
    verificationToken: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', {
      email,
      verificationToken,
      newPassword,
    });
    return response.data;
  },

  // ── Token refresh ─────────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return response.data;
  },

  // ── Storage helpers ───────────────────────────────────────────────────────

  saveSession(response: AuthResponse) {
    localStorage.setItem('tripwise_token', response.accessToken);
    localStorage.setItem('tripwise_refresh_token', response.refreshToken);
    localStorage.setItem('tripwise_user', JSON.stringify(response.user));
  },

  clearSession() {
    localStorage.removeItem('tripwise_token');
    localStorage.removeItem('tripwise_refresh_token');
    localStorage.removeItem('tripwise_user');
    localStorage.removeItem('tripwise_onboarding_completed');
  },
};
