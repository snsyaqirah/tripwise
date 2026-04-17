import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { authService } from '@/services/authService';
import { api } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  completeOnboarding: (data: { country: string; currency: string }) => Promise<void>;
  updateProfile: (data: { name: string; country: string; currency: string }) => Promise<void>;
  setUserFromSession: (user: User, accessToken: string, refreshToken: string) => void;
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

  useEffect(() => {
    const token = localStorage.getItem('tripwise_token');
    const savedUser = localStorage.getItem('tripwise_user');

    if (token && savedUser) {
      try {
        const user: User = JSON.parse(savedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
        if (!user.onboardingCompleted) setNeedsOnboarding(true);
      } catch {
        authService.clearSession();
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    authService.saveSession(response);
    if (!response.user.onboardingCompleted) setNeedsOnboarding(true);
    setAuthState({ user: response.user, isAuthenticated: true, isLoading: false });
  }, []);

  /** Called by OAuthCallback page after Google redirect */
  const setUserFromSession = useCallback(
    (user: User, accessToken: string, refreshToken: string) => {
      localStorage.setItem('tripwise_token', accessToken);
      localStorage.setItem('tripwise_refresh_token', refreshToken);
      localStorage.setItem('tripwise_user', JSON.stringify(user));
      if (!user.onboardingCompleted) setNeedsOnboarding(true);
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    },
    []
  );

  /** Redirect browser to backend Google OAuth — Spring handles the rest */
  const loginWithGoogle = useCallback(() => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setNeedsOnboarding(false);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const completeOnboarding = useCallback(async (data: { country: string; currency: string }) => {
    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data;
      const user = {
        ...updatedUser,
        onboardingCompleted: true,
      };
      localStorage.setItem('tripwise_user', JSON.stringify(user));
      localStorage.setItem('tripwise_onboarding_completed', 'true');
      setNeedsOnboarding(false);
      setAuthState((prev) => ({ ...prev, user }));
    } catch {
      // Fallback: update locally
      localStorage.setItem('tripwise_onboarding_completed', 'true');
      setNeedsOnboarding(false);
      setAuthState((prev) => {
        if (!prev.user) return prev;
        const user = { ...prev.user, ...data, onboardingCompleted: true };
        localStorage.setItem('tripwise_user', JSON.stringify(user));
        return { ...prev, user };
      });
    }
  }, []);

  const updateProfile = useCallback(async (data: { name: string; country: string; currency: string }) => {
    const response = await api.put('/users/profile', data);
    const updatedUser = { ...response.data, onboardingCompleted: true };
    localStorage.setItem('tripwise_user', JSON.stringify(updatedUser));
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithGoogle,
        logout,
        completeOnboarding,
        updateProfile,
        setUserFromSession,
        needsOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
