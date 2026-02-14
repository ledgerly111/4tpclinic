import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockAuthStore } from '../lib/mockAuthStore';

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
    const existingSession = mockAuthStore.getSession();
    if (existingSession) {
      setSession(existingSession);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = mockAuthStore.login(username, password);
      
      if (result.success) {
        setSession(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    mockAuthStore.logout();
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
