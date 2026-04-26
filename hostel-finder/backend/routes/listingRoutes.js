// routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const {
  getListings, getListingById, createListing, updateListing,
  deleteListing, getMyListings, addReview, toggleSaveListing,
} = require('../controllers/listingController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', getListings);
router.get('/:id', getListingById);

// ── Landlord (static route BEFORE :id param) ──────────────────────────────────
router.get('/landlord/my-listings', protect, authorize('landlord'), getMyListings);

// upload.array('images', 10) — accepts up to 10 files under the field name 'images'
router.post(
  '/',
  protect,
  authorize('landlord'),
  upload.array('images', 10),
  createListing
);

router.put(
  '/:id',
  protect,
  authorize('landlord'),
  upload.array('images', 10),
  updateListing
);

router.delete('/:id', protect, authorize('landlord'), deleteListing);

// ── Student ────────────────────────────────────────────────────────────────────
router.post('/:id/reviews', protect, authorize('student'), addReview);
router.post('/:id/save',    protect, authorize('student'), toggleSaveListing);

module.exports = router;
