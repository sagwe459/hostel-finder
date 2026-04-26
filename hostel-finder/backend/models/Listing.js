// models/Listing.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, required: true, trim: true, maxlength: [500, 'Review cannot exceed 500 characters'] },
  },
  { timestamps: true }
);

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: [true, 'Title is required'],
      trim: true, maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String, required: [true, 'Description is required'],
      trim: true, maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'],
    },
    location: {
      type: String, required: [true, 'Location is required'], trim: true,
    },
    coordinates: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    images:    { type: [String], validate: { validator: (arr) => arr.length <= 10, message: 'Maximum 10 images allowed' } },
    amenities: { type: [String], default: [] },
    type: {
      type: String,
      enum: ['bedsitter', 'single-room', 'hostel', 'studio', 'one-bedroom'],
      default: 'bedsitter',
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },

    // ── Units ───────────────────────────────────────────────────────────────
    // How many identical units the landlord has (e.g. 10 single rooms in a block)
    totalUnits: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 unit'],
    },
    // How many of those units are currently vacant / available
    availableUnits: {
      type: Number,
      default: 1,
      min: [0, 'Available units cannot be negative'],
    },

    // isAvailable is automatically derived: true when availableUnits > 0
    // We still store it for backward-compat and fast querying
    isAvailable: {
      type: Boolean,
      default: true,
    },

    reviews:       [reviewSchema],
    averageRating: { type: Number, default: 0 },
    numReviews:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for keyword search
listingSchema.index({ title: 'text', description: 'text', location: 'text' });

// Recalculate average rating after review changes
listingSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews    = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews    = this.reviews.length;
  }
};

// Auto-sync isAvailable whenever availableUnits changes
listingSchema.pre('save', function (next) {
  this.isAvailable = this.availableUnits > 0;
  next();
});

// Also sync on findByIdAndUpdate via a post middleware
listingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.availableUnits !== undefined) {
    update.isAvailable = update.availableUnits > 0;
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);