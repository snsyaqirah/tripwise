import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { authService } from '@/services/authService';
import { api } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  completeOnboarding: (data: { country: string; currency: string }) => void;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('tripwise_token');
    const savedOnboarding = localStorage.getItem('tripwise_onboarding_completed');
    
    if (token) {
      // In a real app, validate token with backend
      const savedUser = localStorage.getItem('tripwise_user');
      const user = savedUser ? JSON.parse(savedUser) : mockUser;
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Check if onboarding is needed
      if (!savedOnboarding && !user.onboardingCompleted) {
        setNeedsOnboarding(true);
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Save to browser storage
      localStorage.setItem('tripwise_token', response.accessToken);
      localStorage.setItem('tripwise_refresh_token', response.refreshToken);
      localStorage.setItem('tripwise_user', JSON.stringify(response.user));
      
      // Check if user needs onboarding
      if (!response.user.onboardingCompleted) {
        setNeedsOnboarding(true);
      }
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });
      
      // Save to browser storage
      localStorage.setItem('tripwise_token', response.accessToken);
      localStorage.setItem('tripwise_refresh_token', response.refreshToken);
      localStorage.setItem('tripwise_user', JSON.stringify(response.user));
      
      // New users always need onboarding
      setNeedsOnboarding(true);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('tripwise_onboarding_completed');
    setNeedsOnboarding(false);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // TODO: Implement Google OAuth flow with backend
    throw new Error('Google login not yet implemented');
  }, []);

  const completeOnboarding = useCallback(async (data: { country: string; currency: string }) => {
    try {
      // Call backend API to update profile
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data;
      
      // Update local state
      setNeedsOnboarding(false);
      localStorage.setItem('tripwise_onboarding_completed', 'true');
      
      setAuthState((prev) => {
        const user = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          country: updatedUser.country,
          currency: updatedUser.currency,
          onboardingCompleted: updatedUser.onboardingCompleted,
        };
        localStorage.setItem('tripwise_user', JSON.stringify(user));
        return { ...prev, user };
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still update locally as fallback
      localStorage.setItem('tripwise_onboarding_completed', 'true');
      setNeedsOnboarding(false);
      
      setAuthState((prev) => {
        if (prev.user) {
          const updatedUser = {
            ...prev.user,
            country: data.country,
            currency: data.currency,
            onboardingCompleted: true,
          };
          localStorage.setItem('tripwise_user', JSON.stringify(updatedUser));
          return { ...prev, user: updatedUser };
        }
        return prev;
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loginWithGoogle,
        completeOnboarding,
        needsOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/*
 * BONUS / UPGRADE NOTES:
 * - Implement proper JWT token validation
 * - Add refresh token logic
 * - Add social login providers (Google, Facebook, Apple)
 * - Add password reset functionality
 * - Add email verification flow
 */
