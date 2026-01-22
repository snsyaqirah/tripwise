import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { mockUser } from '@/data/mockData';

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email && password) {
      const user = { ...mockUser, email, onboardingCompleted: false };
      localStorage.setItem('tripwise_token', 'mock_token_123');
      localStorage.setItem('tripwise_user', JSON.stringify(user));
      
      // Check if this is first login (needs onboarding)
      const savedOnboarding = localStorage.getItem('tripwise_onboarding_completed');
      if (!savedOnboarding) {
        setNeedsOnboarding(true);
      }
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error('Invalid credentials');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (name && email && password) {
      const user = { ...mockUser, name, email, onboardingCompleted: false };
      localStorage.setItem('tripwise_token', 'mock_token_123');
      localStorage.setItem('tripwise_user', JSON.stringify(user));
      
      // New registrations always need onboarding
      setNeedsOnboarding(true);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error('Invalid registration data');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tripwise_token');
    localStorage.removeItem('tripwise_user');
    localStorage.removeItem('tripwise_onboarding_completed');
    setNeedsOnboarding(false);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Placeholder for Google OAuth
    // In production, implement proper OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user = { ...mockUser, onboardingCompleted: false };
    localStorage.setItem('tripwise_token', 'mock_google_token');
    localStorage.setItem('tripwise_user', JSON.stringify(user));
    
    // Google users also need onboarding for country/currency
    const savedOnboarding = localStorage.getItem('tripwise_onboarding_completed');
    if (!savedOnboarding) {
      setNeedsOnboarding(true);
    }
    
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const completeOnboarding = useCallback((data: { country: string; currency: string }) => {
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
