import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigation } from './NavigationContext';

export interface User {
  id: string;
  email: string;
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
          const result = await response.json();
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

  const handleSessionCleanup = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('smart_health_guide_profile'); // Clear local profile cache
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'fail' || result.status === 'error') {
        throw new Error(result.message || 'Registration failed');
      }

      const registeredUser = result.data.user;
      const sessionToken = result.data.session?.access_token || null;

      if (sessionToken) {
        localStorage.setItem(TOKEN_KEY, sessionToken);
        localStorage.setItem(USER_KEY, JSON.stringify(registeredUser));
      }

      setUser(registeredUser);
      setToken(sessionToken);

      setLoading(false);
      // Redirect to profile-form to complete profile
      navigateTo('profile-form');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
      setLoading(false);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'fail' || result.status === 'error') {
        throw new Error(result.message || 'Login failed');
      }

      const loggedInUser = result.data.user;
      const sessionToken = result.data.session?.access_token || null;

      if (sessionToken) {
        localStorage.setItem(TOKEN_KEY, sessionToken);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      }

      // Check if user has an existing Health Profile in Supabase
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      let hasProfile = false;
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.status === 'success' && profileResult.data?.profile) {
          hasProfile = true;
          // Store profile in localStorage cache
          localStorage.setItem('smart_health_guide_profile', JSON.stringify(profileResult.data.profile));
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
  };

  const logout = async () => {
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
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;

    const activeToken = token || localStorage.getItem(TOKEN_KEY);
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      id="auth-provider-wrapper"
      value={{
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
      }}
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
