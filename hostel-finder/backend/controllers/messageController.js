// controllers/messageController.js
// Handles student-to-landlord messages about a listing.

const Message = require('../models/Message');
const Listing = require('../models/Listing');

// ─── POST /api/messages ───────────────────────────────────────────────────────
// Protected — authenticated users (students) send a message about a listing.
const sendMessage = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;

    // Fetch the listing to determine the receiver (landlord)
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Prevent landlords from messaging themselves
    if (listing.landlord.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message about your own listing.',
      });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: listing.landlord,
      listing: listingId,
      message,
    });

    // Populate sender/listing info for the response
    await newMessage.populate('sender', 'name email');
    await newMessage.populate('listing', 'title');

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/messages/:listingId ─────────────────────────────────────────────
// Protected — landlord sees all messages for one of their listings.
const getMessagesByListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Only the landlord who owns the listing can view its messages
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this listing.',
      });
    }

    const messages = await Message.find({ listing: req.params.listingId })
      .populate('sender', 'name email phone')
      .sort('createdAt'); // oldest first for chat-like display

    // Mark all unread messages as read when landlord views them
    await Message.updateMany(
      { listing: req.params.listingId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/messages/inbox ──────────────────────────────────────────────────
// Protected — landlord sees all their messages grouped by listing.
const getLandlordInbox = async (req, res, next) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'name email')
      .populate('listing', 'title location price')
      .sort('-createdAt');

    const unreadCount = messages.filter((m) => !m.isRead).length;

    res.status(200).json({ success: true, unreadCount, messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessagesByListing, getLandlordInbox };
