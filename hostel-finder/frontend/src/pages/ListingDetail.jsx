// src/pages/ListingDetail.jsx
// Shows listing with image carousel, amenities, reviews, messaging.
// Location: if coordinates are set → "View on Google Maps" link.
//           If no coordinates → search Google Maps by address string.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ImageCarousel from '../components/ImageCarousel';
import MessageForm from '../components/MessageForm';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiStar, FiPhone, FiMail, FiHeart,
  FiEdit2, FiTrash2, FiArrowLeft, FiExternalLink,
  FiCheck, FiCalendar, FiNavigation,
} from 'react-icons/fi';
import { formatPrice, formatDate, getInitials, LISTING_TYPES } from '../utils/helpers';

// Build a Google Maps URL.
// If we have coordinates → navigate to exact pin.
// Otherwise → search by address string.
const getGoogleMapsUrl = (listing) => {
  if (listing?.coordinates?.latitude && listing?.coordinates?.longitude) {
    return `https://www.google.com/maps?q=${listing.coordinates.latitude},${listing.coordinates.longitude}`;
  }
  if (listing?.location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location + ', Kenya')}`;
  }
  return null;
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isLandlord, isStudent, refreshUser } = useAuth();

  const [listing, setListing]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [deleting, setDeleting]       = useState(false);
  const [isSaved, setIsSaved]         = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [reviewForm, setReviewForm]   = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data.listing);
        if (user?.savedListings) {
          setIsSaved(user.savedListings.some(
            (s) => (typeof s === 'object' ? s._id : s) === id
          ));
        }
      } catch {
        toast.error('Listing not found.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isOwner = user && listing && listing.landlord?._id === user._id;
  const typeLabel = LISTING_TYPES.find((t) => t.value === listing?.type)?.label;
  const mapsUrl = listing ? getGoogleMapsUrl(listing) : null;
  const hasPinnedLocation = listing?.coordinates?.latitude && listing?.coordinates?.longitude;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) return navigate('/login');
    setSavingToggle(true);
    try {
      const { data } = await api.post(`/listings/${id}/save`);
      setIsSaved(data.saved);
      toast.success(data.message);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setSavingToggle(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/listings/${id}/reviews`, reviewForm);
      setListing(data.listing);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasReviewed = listing?.reviews?.some(
    (r) => r.user?._id === user?._id || r.user === user?._id
  );

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );

  if (!listing) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-800 mb-6 group">
        <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          <ImageCarousel images={listing.images} />

          {/* Title & actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {typeLabel && (
                  <span className="badge bg-primary-100 text-primary-700">{typeLabel}</span>
                )}
                {!listing.isAvailable && (
                  <span className="badge bg-red-100 text-red-600">Not Available</span>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark-900">
                {listing.title}
              </h1>

              {/* Location row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <FiMapPin size={14} className="text-gray-400 shrink-0" />
                <span className="text-sm text-dark-500">{listing.location}</span>

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-full transition-colors border border-green-200"
                  >
                    <FiNavigation size={11} />
                    {hasPinnedLocation ? 'Open exact location' : 'Search on Maps'}
                    <FiExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isStudent && (
                <button
                  onClick={handleSave}
                  disabled={savingToggle}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    isSaved
                      ? 'border-red-300 bg-red-50 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save listing'}
                >
                  <FiHeart size={18} className={isSaved ? 'fill-current' : ''} />
                </button>
              )}

              {isOwner && (
                <>
                  <Link to={`/edit-listing/${id}`} className="btn-secondary !py-2">
                    <FiEdit2 size={14} /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-danger !py-2"
                  >
                    <FiTrash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-dark-900 font-display">
                {formatPrice(listing.price)}
              </p>
              <p className="text-sm text-dark-400">per month</p>
            </div>
            <div className="flex items-center gap-1.5">
              <FiStar size={18} className={listing.averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
              <span className="font-semibold text-dark-800">
                {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'No reviews'}
              </span>
              {listing.numReviews > 0 && (
                <span className="text-sm text-dark-400">
                  ({listing.numReviews} review{listing.numReviews !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-dark-900 text-lg mb-3">About this place</h2>
            <p className="text-dark-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-dark-900 text-lg mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-dark-600">
                    <FiCheck size={14} className="text-primary-500 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-dark-900 text-lg mb-4">
              Reviews {listing.numReviews > 0 && `(${listing.numReviews})`}
            </h2>

            {isStudent && !hasReviewed && (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-dark-800">Leave a review</h3>
                <div>
                  <label className="label text-xs">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className="text-2xl transition-transform hover:scale-110"
                      >
                        {star <= reviewForm.rating ? '★' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-dark-500 self-center">
                      {reviewForm.rating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Share your experience…"
                    rows={3} maxLength={500}
                    className="input resize-none text-sm" required
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary !py-2 text-sm">
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}

            {listing.reviews?.length === 0 ? (
              <p className="text-dark-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {listing.reviews.map((r, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                        {getInitials(r.userName)}
                      </div>
                      <span className="text-sm font-semibold text-dark-800">{r.userName}</span>
                      <div className="flex text-amber-400 text-xs ml-auto">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-dark-600 ml-9">{r.comment}</p>
                    <p className="text-xs text-gray-400 ml-9 mt-1">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Landlord info */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-dark-900 mb-4">Listed by</h3>
            <div className="flex items-center gap-3 mb-4">
              {listing.landlord?.avatar ? (
                <img src={listing.landlord.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  {getInitials(listing.landlord?.name)}
                </div>
              )}
              <div>
                <p className="font-semibold text-dark-800">{listing.landlord?.name}</p>
                <p className="text-xs text-dark-400 flex items-center gap-1">
                  <FiCalendar size={11} />
                  Member since {formatDate(listing.landlord?.createdAt)}
                </p>
              </div>
            </div>

            {listing.landlord?.phone && (
              <a
                href={`tel:${listing.landlord.phone}`}
                className="flex items-center gap-2 text-sm text-dark-600 hover:text-primary-600 mb-2"
              >
                <FiPhone size={14} className="text-primary-400" />
                {listing.landlord.phone}
              </a>
            )}
            <div className="flex items-center gap-2 text-sm text-dark-600">
              <FiMail size={14} className="text-primary-400" />
              <span className="truncate">{listing.landlord?.email}</span>
            </div>
          </div>

          {/* Location card */}
          {mapsUrl && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-dark-900 mb-3 flex items-center gap-2">
                <FiMapPin size={16} className="text-primary-500" /> Location
              </h3>
              <p className="text-sm text-dark-500 mb-3">{listing.location}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center !py-2.5 text-sm"
              >
                <FiNavigation size={14} />
                {hasPinnedLocation ? 'Open exact location' : 'Search on Google Maps'}
                <FiExternalLink size={12} />
              </a>
              {hasPinnedLocation && (
                <p className="text-xs text-center text-green-600 font-medium mt-2">
                  📍 Exact location pinned by landlord
                </p>
              )}
            </div>
          )}

          {/* Listing meta */}
          <div className="card p-5 text-sm space-y-2 text-dark-600">
            <div className="flex justify-between">
              <span className="text-dark-400">Listed on</span>
              <span className="font-medium">{formatDate(listing.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Type</span>
              <span className="font-medium">{typeLabel || listing.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Status</span>
              <span className={`font-medium ${listing.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {listing.isAvailable ? 'Available' : 'Not available'}
              </span>
            </div>
          </div>

          {/* Message form */}
          <MessageForm listingId={id} landlordName={listing.landlord?.name} />
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
