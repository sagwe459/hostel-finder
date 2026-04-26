// src/components/FilterPanel.jsx
// Sidebar / drawer filters: price range, location, type, amenities.

import React, { useState } from 'react';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { AMENITIES_LIST, LISTING_TYPES } from '../utils/helpers';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [expanded, setExpanded] = useState({
    price: true,
    type: true,
    amenities: false,
  });

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange('amenities', updated);
  };

  const Section = ({ id, title, children }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full text-sm font-semibold text-dark-800 mb-3"
      >
        {title}
        <FiChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${expanded[id] ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded[id] && children}
    </div>
  );

  return (
    <aside className="card p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-dark-900 flex items-center gap-2">
          <FiFilter size={16} className="text-primary-500" /> Filters
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-primary-500 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <FiX size={14} /> Reset all
        </button>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="label">Location</label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="e.g. Westlands, Rongai..."
          className="input"
        />
      </div>

      {/* Price range */}
      <Section id="price" title="Price Range (KSh)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="Min"
            min="0"
            className="input text-sm"
          />
          <span className="text-gray-400 text-sm shrink-0">—</span>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="Max"
            min="0"
            className="input text-sm"
          />
        </div>
        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: 'Under 5K', min: '', max: 5000 },
            { label: '5K–15K', min: 5000, max: 15000 },
            { label: '15K–30K', min: 15000, max: 30000 },
            { label: 'Above 30K', min: 30000, max: '' },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => {
                onFilterChange('minPrice', p.min);
                onFilterChange('maxPrice', p.max);
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Listing type */}
      <Section id="type" title="Listing Type">
        <div className="space-y-2">
          {LISTING_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={filters.type === t.value}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="accent-primary-500 w-4 h-4"
              />
              <span className="text-sm text-dark-700">{t.label}</span>
            </label>
          ))}
          {/* Clear type */}
          {filters.type && (
            <button
              onClick={() => onFilterChange('type', '')}
              className="text-xs text-red-400 hover:text-red-600 mt-1"
            >
              Clear type
            </button>
          )}
        </div>
      </Section>

      {/* Amenities */}
      <Section id="amenities" title="Amenities">
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {AMENITIES_LIST.map((a) => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.amenities || []).includes(a)}
                onChange={() => handleAmenityToggle(a)}
                className="accent-primary-500 w-4 h-4 rounded"
              />
              <span className="text-sm text-dark-700">{a}</span>
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
};

export default FilterPanel;
