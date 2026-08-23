import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { safeJsonResponse } from '../utils/apiUtils';

export interface User {
  id: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface ToastNotification {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (nameOrEmail: string, emailOrPassword: string, password?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (params: { accessToken?: string; code?: string; refreshToken?: string; password: string }) => Promise<{ success: boolean; message: string }>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  clearError: () => void;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
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
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 6000);
  }, []);

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
          try {
            const result = await safeJsonResponse(response);
            if (result.status === 'success' && result.data?.user) {
              setUser(result.data.user);
              setToken(savedToken);
            } else {
              handleSessionCleanup();
            }
          } catch (parseErr: any) {
            console.error('[AUTH_DEBUG] Session verification response parsing error:', parseErr);
            // On non-JSON or server error during session check, don't crash or forcibly purge session cache
          }
        } else {
          handleSessionCleanup();
        }
      } catch (err) {
        console.warn('[AUTH_CONTEXT] Connection error verifying session:', err);
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

  const register = useCallback(async (nameOrEmail: string, emailOrPassword: string, passParam?: string) => {
    clearAllUserSessionData();
    setLoading(true);
    setError(null);

    let name = '';
    let email = '';
    let password = '';

    if (passParam !== undefined) {
      name = nameOrEmail;
      email = emailOrPassword;
      password = passParam;
    } else if (nameOrEmail.includes('@')) {
      email = nameOrEmail;
      password = emailOrPassword;
    } else {
      name = nameOrEmail;
      email = emailOrPassword;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      let result: any;
      try {
        result = await safeJsonResponse(response);
      } catch (parseErr: any) {
        const rawServerMessage = parseErr?.message || 'Unexpected non-JSON response';
        console.error('[AUTH_DEBUG] Raw server authentication response text during registration:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          rawError: rawServerMessage,
        });

        const userFriendlyMessage = 'A server error occurred during registration. Please try again in a few moments.';
        showToast(userFriendlyMessage, 'error');
        setError(userFriendlyMessage);
        setLoading(false);
        throw new Error(userFriendlyMessage);
      }

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        const errorMsg = result.message || 'Registration failed';
        showToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      setLoading(false);
      return result;
    } catch (err: any) {
      const isServerParsingErr = err.message && (err.message.includes('FUNCTION_INVOCATION_FAILED') || err.message.includes('non-JSON') || err.message.includes('HTML'));
      const friendlyMsg = isServerParsingErr
        ? 'A server error occurred during registration. Please try again in a few moments.'
        : (err.message || 'An unexpected error occurred during registration.');

      setError(friendlyMsg);
      setLoading(false);
      throw new Error(friendlyMsg);
    }
  }, [showToast]);

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

      let result: any;
      try {
        result = await safeJsonResponse(response);
      } catch (parseErr: any) {
        const rawServerMessage = parseErr?.message || 'Unexpected non-JSON response';
        console.error('[AUTH_DEBUG] Raw server authentication response text during login:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          rawError: rawServerMessage,
        });

        const userFriendlyMessage = 'A server error occurred during authentication. Please try again in a few moments.';
        showToast(userFriendlyMessage, 'error');
        setError(userFriendlyMessage);
        setLoading(false);
        throw new Error(userFriendlyMessage);
      }

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        const errorMsg = result.message || 'Login failed';
        showToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      const loggedInUser = result.data?.user;
      const sessionToken = result.data?.session?.access_token || null;

      if (!sessionToken) {
        const errorMsg = 'Could not obtain authentication token. Please sign in again.';
        showToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      localStorage.setItem(TOKEN_KEY, sessionToken);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));

      // Check if user has an existing Health Profile in Supabase
      let hasProfile = false;
      try {
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          try {
            const profileResult = await safeJsonResponse(profileResponse);
            if (profileResult.status === 'success' && profileResult.data?.profile) {
              hasProfile = true;
              localStorage.setItem(`smart_health_guide_profile_${loggedInUser.id}`, JSON.stringify(profileResult.data.profile));
            }
          } catch (profileParseErr: any) {
            console.warn('[AUTH_DEBUG] Non-JSON or error response checking profile on login:', profileParseErr);
          }
        }
      } catch (profileErr: any) {
        console.warn('[AUTH_DEBUG] Profile fetch network error on login:', profileErr);
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
      const isServerParsingErr = err.message && (err.message.includes('FUNCTION_INVOCATION_FAILED') || err.message.includes('non-JSON') || err.message.includes('HTML'));
      const friendlyMsg = isServerParsingErr
        ? 'A server error occurred during authentication. Please try again in a few moments.'
        : (err.message || 'An unexpected error occurred during login.');

      setError(friendlyMsg);
      setLoading(false);
      throw new Error(friendlyMsg);
    }
  }, [showToast, navigateTo]);

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
  }, [token, handleSessionCleanup]);

  const requestPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let result: any;
      try {
        result = await safeJsonResponse(response);
      } catch (parseErr: any) {
        const msg = 'A server error occurred while requesting password reset. Please try again.';
        showToast(msg, 'error');
        setError(msg);
        setLoading(false);
        throw new Error(msg);
      }

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        const errorMsg = result.message || 'Request failed. Please try again.';
        showToast(errorMsg, 'error');
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      setLoading(false);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to request password reset.';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, [showToast]);

  const resetPassword = useCallback(async (params: { accessToken?: string; code?: string; refreshToken?: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      let result: any;
      try {
        result = await safeJsonResponse(response);
      } catch (parseErr: any) {
        const msg = 'A server error occurred while updating your password. Please try again.';
        showToast(msg, 'error');
        setError(msg);
        setLoading(false);
        throw new Error(msg);
      }

      if (!response.ok || result.status === 'fail' || result.status === 'error' || result.success === false) {
        const errorMsg = result.message || 'Password reset failed. Please try again.';
        showToast(errorMsg, 'error');
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      setLoading(false);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to update password.';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, [showToast]);

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
    requestPasswordReset,
    resetPassword,
    fetchWithAuth,
    clearError,
    showToast,
  }), [user, token, isAuthenticated, loading, error, register, login, logout, requestPasswordReset, resetPassword, fetchWithAuth, clearError, showToast]);

  return (
    <AuthContext.Provider
      id="auth-provider-wrapper"
      value={value}
    >
      {children}
      {toast && (
        <div
          id="auth-toast-notification"
          className="fixed bottom-6 right-6 z-[9999] max-w-md bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="alert"
        >
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            toast.type === 'error'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : toast.type === 'success'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
              : 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 pr-2">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
              {toast.type === 'error' ? 'Authentication Notice' : 'System Notice'}
            </h5>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
            aria-label="Close notification"
            id="auth-toast-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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

