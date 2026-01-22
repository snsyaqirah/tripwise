import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('tripwise_token');
    if (token) {
      // In a real app, validate token with backend
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email && password) {
      localStorage.setItem('tripwise_token', 'mock_token_123');
      setAuthState({
        user: { ...mockUser, email },
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
      localStorage.setItem('tripwise_token', 'mock_token_123');
      setAuthState({
        user: { ...mockUser, name, email },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error('Invalid registration data');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tripwise_token');
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
    localStorage.setItem('tripwise_token', 'mock_google_token');
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
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
