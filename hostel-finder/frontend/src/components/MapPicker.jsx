// src/components/MapPicker.jsx
// WhatsApp-style location sharing.
// One button — triggers GPS permission immediately when tapped.
// No scrolling, no map, no extra steps.

import React, { useState } from 'react';

const MapPicker = ({ lat, lng, onPick }) => {
  const [status,   setStatus]   = useState('idle');
  // idle | requesting | success | denied | unavailable | timeout
  const [accuracy, setAccuracy] = useState(null);

  const hasPinned = lat && lng;

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    // Immediately fires the browser/phone permission prompt — just like WhatsApp
    setStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      // ── Success ────────────────────────────────────────────────────────
      (position) => {
        onPick(position.coords.latitude, position.coords.longitude);
        setAccuracy(Math.round(position.coords.accuracy));
        setStatus('success');
      },
      // ── Error ──────────────────────────────────────────────────────────
      (error) => {
        if (error.code === error.PERMISSION_DENIED)   setStatus('denied');
        else if (error.code === error.TIMEOUT)        setStatus('timeout');
        else                                          setStatus('unavailable');
      },
      {
        enableHighAccuracy: true,  // use GPS chip
        timeout:            15000, // 15 seconds max
        maximumAge:         0,     // always fresh
      }
    );
  };

  const clearLocation = () => {
    onPick(null, null);
    setStatus('idle');
    setAccuracy(null);
  };

  // ── NOT YET SHARED ──────────────────────────────────────────────────────
  if (!hasPinned) {
    return (
      <div className="space-y-3">

        {/* ── Main button — idle ──────────────────────────────────────── */}
        {status === 'idle' && (
          <button
            type="button"
            onClick={requestLocation}
            className="w-full flex items-center gap-4 px-5 py-4 bg-green-500 hover:bg-green-600 active:scale-95 rounded-2xl text-white transition-all duration-200 shadow-sm"
          >
            {/* WhatsApp-style location icon */}
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-base leading-tight">Share my location</p>
              <p className="text-white/80 text-xs mt-0.5">Tap to enable GPS and share exact location</p>
            </div>
            {/* Arrow */}
            <svg className="ml-auto shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        {/* ── Requesting — spinner ────────────────────────────────────── */}
        {status === 'requesting' && (
          <div className="w-full flex items-center gap-4 px-5 py-4 bg-green-500/80 rounded-2xl text-white cursor-not-allowed">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">Getting your location…</p>
              <p className="text-white/80 text-xs mt-0.5">Allow location access when your phone asks</p>
            </div>
          </div>
        )}

        {/* ── DENIED — explain how to fix ────────────────────────────── */}
        {status === 'denied' && (
          <div className="space-y-3">
            {/* Red error card */}
            <div className="w-full flex items-start gap-4 px-5 py-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-700 text-sm">Location access blocked</p>
                <p className="text-red-600 text-xs mt-1 leading-relaxed">
                  You denied location permission. To fix this:
                </p>
              </div>
            </div>

            {/* Step-by-step fix instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
              <p className="text-xs font-bold text-dark-700 uppercase tracking-wide">How to enable location</p>
              <div className="space-y-1.5">
                {[
                  { icon: '📱', text: 'Open your phone Settings' },
                  { icon: '🌐', text: 'Go to Browser (Chrome / Safari)' },
                  { icon: '📍', text: 'Find "Location" and set to Allow' },
                  { icon: '🔄', text: 'Come back and tap the button again' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{step.icon}</span>
                    <span className="text-xs text-dark-600">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── TIMEOUT ────────────────────────────────────────────────── */}
        {status === 'timeout' && (
          <div className="space-y-3">
            <div className="w-full flex items-start gap-4 px-5 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-lg">⏱️</span>
              </div>
              <div>
                <p className="font-bold text-amber-700 text-sm">Location timed out</p>
                <p className="text-amber-600 text-xs mt-1 leading-relaxed">
                  GPS took too long. Make sure location (GPS) is turned on in your phone settings, then try again.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── UNAVAILABLE (no GPS hardware / old browser) ─────────────── */}
        {status === 'unavailable' && (
          <div className="w-full flex items-start gap-4 px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-lg">📵</span>
            </div>
            <div>
              <p className="font-bold text-dark-700 text-sm">Location not available</p>
              <p className="text-dark-400 text-xs mt-1">
                Your device or browser doesn't support GPS. The address field above will still help students find you.
              </p>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── LOCATION SHARED SUCCESSFULLY ─────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Green success card — like WhatsApp's "Location shared" */}
      <div className="w-full flex items-center gap-4 px-5 py-4 bg-green-500 rounded-2xl text-white">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          {/* Checkmark */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-base leading-tight">Location shared ✓</p>
          <p className="text-white/80 text-xs mt-0.5">
            {accuracy ? `Accurate to ~${accuracy}m` : 'GPS coordinates saved'}
          </p>
        </div>
      </div>

      {/* Coordinates pill */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4622A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="text-xs text-dark-600 font-mono flex-1 truncate">
          {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
        </span>
        {/* Preview on maps */}
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-500 font-semibold hover:underline shrink-0"
        >
          Preview →
        </a>
      </div>

      {/* Student info note */}
      <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 font-medium">
        📍 Students will see an "Open on Google Maps" button that takes them directly to this location.
      </p>

      {/* Remove */}
      <button
        type="button"
        onClick={clearLocation}
        className="w-full py-2.5 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-300 rounded-xl bg-white hover:bg-red-50 transition-colors"
      >
        ✕ Remove location
      </button>
    </div>
  );
};

export default MapPicker;