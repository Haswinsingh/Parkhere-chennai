import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, role?: string) => Promise<User>;
  register: (formData: FormData | Record<string, any>) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('parkhere_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('parkhere_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Clean up any old device-saved accounts from local storage to guarantee 100% privacy
  useEffect(() => {
    try {
      localStorage.removeItem('parkhere_saved_accounts');
    } catch {
      // Ignore
    }
  }, []);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      const currentUser = res.data?.user || (res as any).user;
      if (res.success && currentUser) {
        setUser(currentUser);
        localStorage.setItem('parkhere_user', JSON.stringify(currentUser));
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('parkhere_token');
      localStorage.removeItem('parkhere_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (
    identifier: string,
    password: string,
    role?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login({ identifier, password, role });
      const responseData = res.data || (res as any);
      const newToken = responseData?.token || (res as any).token;
      const newUser = responseData?.user || (res as any).user;

      if (res.success && newToken && newUser) {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('parkhere_token', newToken);
        localStorage.setItem('parkhere_user', JSON.stringify(newUser));
        return newUser;
      }
      throw new Error(res.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: FormData | Record<string, any>): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(formData);
      const responseData = res.data || (res as any);
      const newToken = responseData?.token || (res as any).token;
      const newUser = responseData?.user || (res as any).user;

      if (res.success && newToken && newUser) {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('parkhere_token', newToken);
        localStorage.setItem('parkhere_user', JSON.stringify(newUser));
        return newUser;
      }
      throw new Error(res.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkhere_token');
    localStorage.removeItem('parkhere_user');
    localStorage.removeItem('parkhere_saved_accounts');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
