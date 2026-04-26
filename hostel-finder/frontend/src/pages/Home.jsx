// src/pages/Home.jsx
// Main listings page with search, filters, and paginated grid.

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { FiSliders, FiX, FiLoader } from 'react-icons/fi';

const DEFAULT_FILTERS = {
  location: '', minPrice: '', maxPrice: '',
  amenities: [], type: '',
};

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search & filter state
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false); // mobile toggle

  // ── Fetch listings whenever search/filter/page changes ─────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        ...(keyword && { keyword }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.type && { type: filters.type }),
        ...(filters.amenities.length > 0 && { amenities: filters.amenities.join(',') }),
      };

      const { data } = await api.get('/listings', { params });
      setListings(data.listings);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, keyword, filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Reset page to 1 when search/filters change
  const handleSearch = (kw) => { setKeyword(kw); setPage(1); };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  const activeFilterCount =
    (filters.location ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.type ? 1 : 0) +
    filters.amenities.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Hero search ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-dark-900 mb-2">
          Find your perfect <span className="text-primary-500">home</span>
        </h1>
        <p className="text-dark-500 mb-6">
          Browse hostels and bedsitters across Kenya — direct from landlords, zero broker fees.
        </p>
        <SearchBar onSearch={handleSearch} defaultValue={keyword} />
      </div>

      <div className="flex gap-6">

        {/* ── Sidebar filters (desktop) ────────────────────────────────────── */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Results header + mobile filter toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-dark-500">
              {loading ? 'Loading…' : (
                <>
                  <span className="font-semibold text-dark-800">{total}</span>{' '}
                  listing{total !== 1 ? 's' : ''} found
                  {keyword && <> for "<em>{keyword}</em>"</>}
                </>
              )}
            </p>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden btn-secondary !py-2 !px-3 text-sm relative"
            >
              <FiSliders size={14} /> Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🏚️</span>
              <h3 className="font-display font-semibold text-dark-700 text-xl mb-2">No listings found</h3>
              <p className="text-dark-400 mb-4">
                Try adjusting your search or filters.
              </p>
              <button onClick={handleResetFilters} className="btn-secondary">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Listings grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 page-enter">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary !py-2 !px-4 disabled:opacity-40"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…' ? (
                        <span key={`ellipsis-${i}`} className="text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all
                            ${p === page
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-dark-700 hover:border-primary-300'
                            }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="btn-secondary !py-2 !px-4 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-dark-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={() => { handleResetFilters(); setShowFilters(false); }}
            />
            <div className="pt-4">
              <button onClick={() => setShowFilters(false)} className="btn-primary w-full">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
