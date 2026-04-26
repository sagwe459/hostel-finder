// routes/messageRoutes.js

const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getMessagesByListing,
  getLandlordInbox,
} = require('../controllers/messageController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Send a message (students only)
router.post('/', protect, authorize('student'), sendMessage);

// Landlord inbox (all messages)
router.get('/inbox', protect, authorize('landlord'), getLandlordInbox);

// Messages for a specific listing (landlord only)
router.get('/:listingId', protect, authorize('landlord'), getMessagesByListing);

module.exports = router;
