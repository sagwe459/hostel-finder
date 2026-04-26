// src/components/ProtectedRoute.jsx
// Wraps routes that require authentication (and optionally a specific role).
// Redirects to /login if not logged in, or back home if wrong role.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login, preserve intended destination
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect home
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
