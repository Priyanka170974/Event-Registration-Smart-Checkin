import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(tokenStorage.get()));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const handleUnauthorized = () => clearSession();
    window.addEventListener('eventflow:unauthorized', handleUnauthorized);

    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
        window.removeEventListener('eventflow:unauthorized', handleUnauthorized);
      };
    }

    authService
      .me()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) clearSession();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener('eventflow:unauthorized', handleUnauthorized);
    };
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    tokenStorage.set(result.token);
    setUser(result.user);
    setIsLoading(false);
    return result.user;
  }, []);

  const signup = useCallback(async (details) => {
    const result = await authService.signup(details);
    tokenStorage.set(result.token);
    setUser(result.user);
    setIsLoading(false);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.get()) await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
