// src/utils/helpers.js

/**
 * Format a number as Kenyan Shillings currency string.
 * e.g. 8500 → "KSh 8,500"
 */
export const formatPrice = (amount) => {
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
};

/**
 * Truncate a string to a max length and append ellipsis.
 */
export const truncate = (str, max = 100) => {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
};

/**
 * Format an ISO date string to a readable format.
 * e.g. "2024-01-15T10:30:00Z" → "15 Jan 2024"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Render star rating as a string of filled/empty stars.
 * e.g. 3.5 → "★★★½☆"
 * (used for aria-label; visual stars are rendered in StarRating component)
 */
export const ratingLabel = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

/**
 * Get initials from a name for avatar fallback.
 * e.g. "John Kamau" → "JK"
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Build a Google Maps URL from coordinates or a location string.
 */
export const getMapsUrl = (listing) => {
  if (listing?.coordinates?.latitude && listing?.coordinates?.longitude) {
    return `https://www.google.com/maps?q=${listing.coordinates.latitude},${listing.coordinates.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing?.location || '')}`;
};

/**
 * List of predefined amenities shown as checkboxes in forms.
 */
export const AMENITIES_LIST = [
  'WiFi',
  'Water',
  'Electricity',
  'Security',
  'Parking',
  'Shared Kitchen',
  'Study Room',
  'Lounge',
  'CCTV',
  'Caretaker',
  'Backup Generator',
  'Gym',
  'Swimming Pool',
  'Balcony',
  'Laundry',
  'Pet Friendly',
];

/**
 * Listing type options.
 */
export const LISTING_TYPES = [
  { value: 'bedsitter',    label: 'Bedsitter' },
  { value: 'single-room',  label: 'Single Room' },
  { value: 'hostel',       label: 'Hostel Room' },
  { value: 'studio',       label: 'Studio' },
  { value: 'one-bedroom',  label: 'One Bedroom' },
];
