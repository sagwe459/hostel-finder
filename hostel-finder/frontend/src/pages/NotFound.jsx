// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <span className="text-8xl mb-6 block">🏚️</span>
    <h1 className="font-display text-5xl font-bold text-dark-900 mb-3">404</h1>
    <p className="text-dark-500 text-lg mb-8">
      Oops! This page doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary !py-3 !px-8 text-base">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
