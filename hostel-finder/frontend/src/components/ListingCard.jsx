// src/components/ListingCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiWifi } from 'react-icons/fi';
import { formatPrice, truncate, LISTING_TYPES } from '../utils/helpers';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

const ListingCard = ({ listing }) => {
  const {
    _id, title, description, price, location,
    images, amenities = [],
    averageRating, numReviews, type,
    isAvailable, totalUnits, availableUnits,
  } = listing;

  const image     = images?.[0] || PLACEHOLDER;
  const typeLabel = LISTING_TYPES.find((t) => t.value === type)?.label || type;

  // Determine availability display
  // availableUnits may be undefined for old seeded data — fall back to isAvailable
  const hasUnits   = totalUnits != null && totalUnits > 1;
  const avail      = availableUnits ?? (isAvailable ? 1 : 0);
  const isReallyAvailable = isAvailable !== false && avail > 0;

  return (
    <Link to={`/listings/${_id}`} className="card group block overflow-hidden">
      {/* ── Image ────────────────────────────────────────────────────────── */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={image} alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
          <p className="text-sm font-bold text-dark-900">{formatPrice(price)}</p>
          <p className="text-xs text-gray-400">/month</p>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="badge bg-primary-500 text-white">{typeLabel}</span>
        </div>

        {/* Availability overlay — only shown when NOT available */}
        {!isReallyAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge bg-red-500 text-white text-sm px-4 py-2">Not Available</span>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-dark-900 text-base mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
          <FiMapPin size={13} className="shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <p className="text-sm text-dark-500 mb-3 line-clamp-2">{truncate(description, 90)}</p>

        {/* Units badge — shown when landlord listed multiple units */}
        {hasUnits && (
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
            avail > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${avail > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {avail > 0 ? `${avail} of ${totalUnits} units available` : `All ${totalUnits} units occupied`}
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 3).map((a) => (
              <span key={a} className="badge bg-gray-100 text-dark-500">
                {a === 'WiFi' && <FiWifi size={10} />}
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="badge bg-gray-100 text-dark-400">+{amenities.length - 3} more</span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <FiStar size={14} className={averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
            <span className="text-sm font-semibold text-dark-700">
              {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews'}
            </span>
            {numReviews > 0 && <span className="text-xs text-gray-400">({numReviews})</span>}
          </div>
          <span className="text-xs font-medium text-primary-500 group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;