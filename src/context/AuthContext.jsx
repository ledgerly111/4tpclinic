import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  logoutApi,
  getSessionApi,
  getStoredSession,
  setStoredSession,
  clearStoredSession,
} from '../lib/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const restore = async () => {
      const existing = getStoredSession();
      if (!existing?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getSessionApi();
        const restored = { ...result.user, token: existing.token };
        setSession(restored);
        setStoredSession(restored);
      } catch {
        clearStoredSession();
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await loginApi(username, password);
      const nextSession = { ...result.user, token: result.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return { success: true, user: nextSession };
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutApi().catch(() => {});
    clearStoredSession();
    sessionStorage.removeItem('clinic_selected_tenant');
    setSession(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get redirect path based on role
  const getRoleRedirectPath = useCallback((role) => {
    switch (role) {
      case 'super_admin':
        return '/super-admin';
      case 'admin':
        return '/dashboard';
      case 'staff':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }, []);

  const value = {
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    login,
    logout,
    clearError,
    getRoleRedirectPath,
    user: session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
