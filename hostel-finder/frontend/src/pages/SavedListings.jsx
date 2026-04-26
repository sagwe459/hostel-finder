// src/pages/SavedListings.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SavedListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await api.get('/auth/me');

        // savedListings is now populated with full fields including isAvailable.
        // Filter to only objects (fully populated), not bare ObjectId strings.
        const populated = (data.user?.savedListings || []).filter(
          (l) => l && typeof l === 'object' && l._id
        );

        setListings(populated);
      } catch {
        toast.error('Failed to load saved listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-52 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart size={24} className="text-red-400 fill-red-400" />
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-900">Saved Listings</h1>
          <p className="text-dark-500 text-sm mt-0.5">
            {listings.length} saved propert{listings.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="card p-16 text-center">
          <FiHeart size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-display font-semibold text-dark-700 text-xl mb-2">
            No saved listings yet
          </h3>
          <p className="text-dark-400 mb-6">
            When you find listings you like, tap the heart icon to save them here.
          </p>
          <Link to="/" className="btn-primary inline-flex">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListings;