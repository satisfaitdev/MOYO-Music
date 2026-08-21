"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken, removeAuthToken, getAuthToken } from './api';

export interface User {
  id: string;
  full_name: string;
  artist_name?: string;
  email?: string;
  phone_number: string;
  role: 'artist' | 'organizer' | 'painter' | 'fan' | 'admin';
  wallet_balance_fcfa: string | number;
  avatar_url?: string;
  bio?: string;
  momo_number?: string;
  airtel_number?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await authApi.getProfile();
      if (res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('moyo_user', JSON.stringify(res.user));
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil :', error);
      removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier si un profil sauvegardé existe
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('moyo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }
    refreshProfile();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    const res = await authApi.login(credentials);
    if (res.token && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('moyo_user', JSON.stringify(res.user));
      }
    }
  };

  const register = async (userData: any) => {
    const res = await authApi.register(userData);
    if (res.token && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('moyo_user', JSON.stringify(res.user));
      }
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
}
