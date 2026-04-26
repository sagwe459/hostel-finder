// src/context/AuthContext.jsx
// Global authentication context.
// Provides: user state, login, register, logout, token persistence.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Custom hook for easy consumption in any component
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage so login persists across page refreshes
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // ── Persist user to localStorage whenever it changes ─────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('hf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_user');
      localStorage.removeItem('hf_token');
    }
  }, [user]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('hf_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('hf_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ── Refresh user data from server ─────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      // Token invalid — log out silently
      logout();
    }
  }, [logout]);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isLandlord: user?.role === 'landlord',
    isStudent: user?.role === 'student',
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
