import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from './NavigationContext';
import { safeJsonResponse } from '../utils/apiUtils';

export interface User {
  id: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'smart_health_guide_token';
const USER_KEY = 'smart_health_guide_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo } = useNavigation();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify saved session on startup
    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await safeJsonResponse(response);
          if (result.status === 'success' && result.data?.user) {
            setUser(result.data.user);
            setToken(savedToken);
          } else {
            // Clean up invalid session
            handleSessionCleanup();
          }
        } else {
          handleSessionCleanup();
        }
      } catch (err) {
        console.warn('[AUTH_CONTEXT] Connection error verifying session:', err);
        // Do not force logout on temporary network glitch if we have local user cache
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const clearAllUserSessionData = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'smart_health_guide_managed_foods' && key !== 'theme') {
          if (
            key.startsWith('smart_health_guide_') ||
            key.startsWith('health_') ||
            key.startsWith('user_')
          ) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error('[AUTH_CONTEXT] Error clearing user localStorage:', e);
    }
  };

  const handleSessionCleanup = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAllUserSessionData();
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    clearAllUserSessionData();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await safeJsonResponse(response);

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        throw new Error(result.message || 'Registration failed');
      }

      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
      setLoading(false);
      throw err;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    clearAllUserSessionData();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await safeJsonResponse(response);

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        throw new Error(result.message || 'Login failed');
      }

      const loggedInUser = result.data.user;
      const sessionToken = result.data.session?.access_token || null;

      if (!sessionToken) {
        throw new Error('Could not obtain authentication token. Please sign in again.');
      }

      localStorage.setItem(TOKEN_KEY, sessionToken);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));

      // Check if user has an existing Health Profile in Supabase
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      let hasProfile = false;
      if (profileResponse.ok) {
        const profileResult = await safeJsonResponse(profileResponse);
        if (profileResult.status === 'success' && profileResult.data?.profile) {
          hasProfile = true;
          // Store profile in user-scoped localStorage cache
          localStorage.setItem(`smart_health_guide_profile_${loggedInUser.id}`, JSON.stringify(profileResult.data.profile));
        }
      }

      setUser(loggedInUser);
      setToken(sessionToken);

      setLoading(false);
      if (hasProfile) {
        navigateTo('dashboard');
      } else {
        navigateTo('profile-form');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      setLoading(false);
      throw err;
    }
  }, [navigateTo]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.warn('[AUTH_CONTEXT] Could not notify server about logout:', err);
    } finally {
      handleSessionCleanup();
      setLoading(false);
      navigateTo('landing');
    }
  }, [token, handleSessionCleanup, navigateTo]);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;

    const activeToken = token || localStorage.getItem(TOKEN_KEY);
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let fetchSignal = options.signal;

    if (!fetchSignal && typeof AbortController !== 'undefined') {
      controller = new AbortController();
      fetchSignal = controller.signal;
      timeoutId = setTimeout(() => {
        controller?.abort();
      }, 15000); // 15-second network timeout guard
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: fetchSignal,
      });

      if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
        console.warn('[AUTH_CONTEXT] 401 Unauthorized encountered on endpoint:', url);
        handleSessionCleanup();
      }

      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Network request timed out. Please check your connection and try again.');
      }
      throw err;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = !!user && !!token;

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    fetchWithAuth,
    clearError,
  }), [user, token, isAuthenticated, loading, error, register, login, logout, fetchWithAuth, clearError]);

  return (
    <AuthContext.Provider
      id="auth-provider-wrapper"
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
