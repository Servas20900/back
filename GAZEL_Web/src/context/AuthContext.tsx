import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('gazel_user');
    const token = localStorage.getItem('access_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gazel_user');
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password }) as AuthResponse;
      
      const userData: User = {
        id_user: response.id_user,
        full_name: response.full_name,
        email: response.email,
        avatar: response.avatar,
        role: response.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('gazel_user', JSON.stringify(userData));
      localStorage.setItem('access_token', response.access_token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({ 
        full_name: fullName, 
        email, 
        password,
        phone 
      }) as AuthResponse;

      const userData: User = {
        id_user: response.id_user,
        full_name: response.full_name,
        email: response.email,
        avatar: response.avatar,
        role: response.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('gazel_user', JSON.stringify(userData));
      localStorage.setItem('access_token', response.access_token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gazel_user');
    localStorage.removeItem('access_token');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('gazel_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
