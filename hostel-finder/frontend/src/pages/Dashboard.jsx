// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, LISTING_TYPES } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FiPlusCircle, FiEdit2, FiTrash2, FiEye,
  FiMessageCircle, FiMapPin, FiStar,
  FiHome, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('listings');
  const [deleting, setDeleting] = useState(null);

  // Quick-update available units inline without navigating to edit page
  const [updatingUnits, setUpdatingUnits] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listRes, msgRes] = await Promise.all([
          api.get('/listings/landlord/my-listings'),
          api.get('/messages/inbox'),
        ]);
        setListings(listRes.data.listings);
        setMessages(msgRes.data.messages);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success('Listing deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  // Quickly update available units from dashboard without going to edit page
  const handleQuickUnitUpdate = async (listingId, totalUnits, newAvailable) => {
    const avail = Math.max(0, Math.min(Number(newAvailable), Number(totalUnits)));
    setUpdatingUnits(listingId);
    try {
      const fd = new FormData();
      fd.append('availableUnits', String(avail));
      fd.append('keepImages',     JSON.stringify(
        listings.find((l) => l._id === listingId)?.images || []
      ));
      const { data } = await api.put(`/listings/${listingId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setListings((prev) =>
        prev.map((l) => l._id === listingId ? data.listing : l)
      );
      toast.success(`Available units updated to ${avail}`);
    } catch (err) {
      toast.error('Failed to update units.');
    } finally {
      setUpdatingUnits(null);
    }
  };

  const totalListings   = listings.length;
  const activeListings  = listings.filter((l) => l.isAvailable).length;
  const totalReviews    = listings.reduce((sum, l) => sum + l.numReviews, 0);
  const unreadMessages  = messages.filter((m) => !m.isRead).length;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-dark-500 mt-1">
            Welcome back, <span className="font-semibold text-dark-700">{user?.name}</span>
          </p>
        </div>
        <Link to="/add-listing" className="btn-primary">
          <FiPlusCircle size={16} /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiHome,          label: 'Total',    value: totalListings,  color: 'text-blue-500',   bg: 'bg-blue-50'   },
          { icon: FiCheckCircle,   label: 'Active',   value: activeListings, color: 'text-green-500',  bg: 'bg-green-50'  },
          { icon: FiStar,          label: 'Reviews',  value: totalReviews,   color: 'text-amber-500',  bg: 'bg-amber-50'  },
          { icon: FiMessageCircle, label: 'Messages', value: messages.length,color: 'text-purple-500', bg: 'bg-purple-50', badge: unreadMessages },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 relative`}>
              <stat.icon size={20} className={stat.color} />
              {stat.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-dark-900 font-display">{stat.value}</p>
            <p className="text-sm text-dark-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'listings', label: `My Listings (${totalListings})` },
          { key: 'messages', label: `Messages ${unreadMessages > 0 ? `(${unreadMessages} new)` : `(${messages.length})`}` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t.key ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        <>
          {listings.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-5xl block mb-4">🏠</span>
              <h3 className="font-display font-semibold text-dark-700 text-xl mb-2">No listings yet</h3>
              <p className="text-dark-400 mb-4">Add your first listing to get started.</p>
              <Link to="/add-listing" className="btn-primary inline-flex"><FiPlusCircle size={16} /> Add Listing</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const typeLabel = LISTING_TYPES.find((t) => t.value === listing.type)?.label;
                const hasMultiple = listing.totalUnits > 1;

                return (
                  <div key={listing._id} className="card p-4">
                    <div className="flex gap-4 items-start">
                      {/* Thumbnail */}
                      <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {listing.images?.[0]
                          ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-dark-900 truncate">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-dark-400 mt-0.5">
                              <FiMapPin size={12} />
                              <span className="truncate">{listing.location}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-dark-900">{formatPrice(listing.price)}</p>
                            <p className="text-xs text-dark-400">/month</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {typeLabel && <span className="badge bg-gray-100 text-dark-500">{typeLabel}</span>}
                          <span className={`badge ${listing.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {listing.isAvailable ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                            {listing.isAvailable ? 'Available' : 'Occupied'}
                          </span>
                          {listing.numReviews > 0 && (
                            <span className="badge bg-amber-50 text-amber-600">
                              <FiStar size={10} className="fill-current" />
                              {listing.averageRating} ({listing.numReviews})
                            </span>
                          )}
                          <span className="text-xs text-dark-400 ml-auto">{formatDate(listing.createdAt)}</span>
                        </div>

                        {/* ── Units quick-update ─────────────────────────── */}
                        <div className={`mt-3 pt-3 border-t border-gray-50 ${hasMultiple ? '' : ''}`}>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-dark-400 font-medium">
                              {hasMultiple
                                ? `Units: ${listing.availableUnits} / ${listing.totalUnits} available`
                                : 'Single unit listing'}
                            </span>

                            {/* Quick unit selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-dark-500">Available:</span>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  disabled={updatingUnits === listing._id || listing.availableUnits <= 0}
                                  onClick={() => handleQuickUnitUpdate(listing._id, listing.totalUnits, listing.availableUnits - 1)}
                                  className="px-2 py-1 text-sm font-bold text-dark-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                                >−</button>
                                <span className="px-3 py-1 text-sm font-bold text-dark-900 bg-white border-x border-gray-200 min-w-[2.5rem] text-center">
                                  {updatingUnits === listing._id ? '…' : listing.availableUnits}
                                </span>
                                <button
                                  type="button"
                                  disabled={updatingUnits === listing._id || listing.availableUnits >= listing.totalUnits}
                                  onClick={() => handleQuickUnitUpdate(listing._id, listing.totalUnits, listing.availableUnits + 1)}
                                  className="px-2 py-1 text-sm font-bold text-dark-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                                >+</button>
                              </div>
                              <span className="text-xs text-dark-400">of {listing.totalUnits}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link to={`/listings/${listing._id}`} title="View"
                          className="p-2 text-dark-500 hover:text-dark-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiEye size={16} />
                        </Link>
                        <Link to={`/edit-listing/${listing._id}`} title="Edit"
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          disabled={deleting === listing._id}
                          title="Delete"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <>
          {messages.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-5xl block mb-4">💬</span>
              <h3 className="font-display font-semibold text-dark-700 text-xl mb-2">No messages yet</h3>
              <p className="text-dark-400">Students will contact you here when they're interested.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg._id}
                  className={`card p-4 ${!msg.isRead ? 'border-l-4 border-primary-400' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-dark-800 text-sm">{msg.sender?.name}</p>
                        {!msg.isRead && <span className="badge bg-primary-100 text-primary-600 text-xs">New</span>}
                        <span className="text-xs text-dark-400 ml-auto">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-dark-400 mb-2 flex items-center gap-1">
                        <FiHome size={10} /> Re: {msg.listing?.title}
                      </p>
                      <p className="text-sm text-dark-600">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50 text-xs">
                    {msg.sender?.email && (
                      <a href={`mailto:${msg.sender.email}`} className="text-primary-500 hover:underline flex items-center gap-1">
                        📧 {msg.sender.email}
                      </a>
                    )}
                    {msg.sender?.phone && (
                      <a href={`tel:${msg.sender.phone}`} className="text-primary-500 hover:underline flex items-center gap-1">
                        📞 {msg.sender.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;