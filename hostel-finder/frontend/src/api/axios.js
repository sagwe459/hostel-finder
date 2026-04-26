// src/api/axios.js
// Preconfigured Axios instance used for all API calls.
// Automatically attaches the JWT token from localStorage to every request.

import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:5000 via vite.config.js
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle global 401 ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('hf_token');
      localStorage.removeItem('hf_user');
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
