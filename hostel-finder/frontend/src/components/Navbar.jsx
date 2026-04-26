// src/components/Navbar.jsx
// Top navigation bar — responsive, with mobile hamburger menu.

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import {
  FiHome, FiPlusCircle, FiLayout, FiLogOut,
  FiLogIn, FiMenu, FiX, FiHeart,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isLoggedIn, isLandlord, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${isActive(to)
          ? 'bg-primary-50 text-primary-600'
          : 'text-dark-600 hover:text-dark-900 hover:bg-gray-100'
        }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl">🏠</span>
            <span className="font-display font-bold text-dark-900 text-lg leading-tight">
              Home<span className="text-primary-500">Finder</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={FiHome} label="Listings" />

            {isLoggedIn && isLandlord && (
              <>
                <NavLink to="/dashboard" icon={FiLayout} label="Dashboard" />
                <NavLink to="/add-listing" icon={FiPlusCircle} label="Add Listing" />
              </>
            )}

            {isLoggedIn && !isLandlord && (
              <NavLink to="/saved" icon={FiHeart} label="Saved" />
            )}
          </div>

          {/* ── Auth Buttons ──────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* User avatar */}
                <div className="flex items-center gap-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-dark-800 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-secondary !py-2 !px-3 text-xs">
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-2">Sign in</Link>
                <Link to="/register" className="btn-primary !py-2">Get started</Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 space-y-1">
            <NavLink to="/" icon={FiHome} label="Listings" />

            {isLoggedIn && isLandlord && (
              <>
                <NavLink to="/dashboard" icon={FiLayout} label="Dashboard" />
                <NavLink to="/add-listing" icon={FiPlusCircle} label="Add Listing" />
              </>
            )}

            {isLoggedIn && !isLandlord && (
              <NavLink to="/saved" icon={FiHeart} label="Saved" />
            )}

            <div className="pt-2 border-t border-gray-100">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-800">{user?.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full btn-secondary text-sm">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center">
                    Sign in
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center">
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
