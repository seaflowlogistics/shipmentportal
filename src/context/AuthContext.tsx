import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import type { User, LoginCredentials, AuthState } from '../lib/types';
import {
  saveAuthData,
  clearAuthData,
  getStoredUser,
  getStoredTokens,
  getRoleRedirectPath,
} from '../utils/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setState((prev) => ({
          ...prev,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }));
        // Reschedule token refresh
        scheduleTokenRefresh();
      } else {
        // Refresh failed, logout user
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Schedule token refresh 1 minute before expiration (15m - 1m = 14m)
  const scheduleTokenRefresh = () => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Schedule refresh after 14 minutes (840 seconds)
    // Tokens expire in 15 minutes, so refresh 1 minute before
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      const { accessToken, refreshToken } = getStoredTokens();

      if (storedUser && accessToken && refreshToken) {
        try {
          // Verify token is still valid by fetching current user
          const { user } = await authApi.getCurrentUser();
          setState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // Start token refresh timer
          scheduleTokenRefresh();
        } catch (error) {
          // Token is invalid, clear auth data
          clearAuthData();
          setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response;

      saveAuthData(accessToken, refreshToken, user);

      setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Start token refresh timer
      scheduleTokenRefresh();

      // If user must change password, redirect to change password page
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        // Redirect to role-specific dashboard
        const redirectPath = getRoleRedirectPath(user.role);
        navigate(redirectPath);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.refreshToken) {
        await authApi.logout(state.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      clearAuthData();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/login');
    }
  };

  const updateUser = (user: User): void => {
    setState((prev) => ({ ...prev, user }));
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
