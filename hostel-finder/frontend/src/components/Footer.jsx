// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <span className="font-display font-bold text-dark-800">
            Home<span className="text-primary-500">Finder</span>
          </span>
        </Link>

        <p className="text-sm text-dark-400 text-center">
          Connecting students & landlords across Kenya — zero broker fees.
        </p>

        <p className="text-xs text-dark-300">
          © {new Date().getFullYear()} HomeFinder Kenya
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
