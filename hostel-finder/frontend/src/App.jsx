// src/App.jsx
// Root component. Defines all application routes and layout.
// Uses React Router v6 with nested layouts.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — lazy-loadable in production builds
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import AddListing from './pages/AddListing';
import Dashboard from './pages/Dashboard';
import SavedListings from './pages/SavedListings';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Persistent top navigation */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1">
        <Routes>
          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          {/* ── Student-only routes ─────────────────────────────────────── */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute role="student">
                <SavedListings />
              </ProtectedRoute>
            }
          />

          {/* ── Landlord-only routes ────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="landlord">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute role="landlord">
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute role="landlord">
                {/* AddListing detects the :id param and switches to edit mode */}
                <AddListing />
              </ProtectedRoute>
            }
          />

          {/* ── Fallbacks ───────────────────────────────────────────────── */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
