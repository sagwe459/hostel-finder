// models/Message.js
// Schema for messages sent by students to landlords about a listing.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    // Marks message as read by the receiver
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // timestamp stored as createdAt
  }
);

module.exports = mongoose.model('Message', messageSchema);
