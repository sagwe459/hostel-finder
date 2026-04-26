// controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      phone:        user.phone,
      avatar:       user.avatar,
      savedListings:user.savedListings,
      createdAt:    user.createdAt,
    },
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
    }
    const user = await User.create({ name, email, password, role, phone });
    sendAuthResponse(user, 201, res);
  } catch (error) { next(error); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    sendAuthResponse(user, 200, res);
  } catch (error) { next(error); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'savedListings',
      // ── FIX: include ALL fields needed by ListingCard and SavedListings page ──
      'title price location images isAvailable availableUnits totalUnits type averageRating numReviews amenities'
    );
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

// PUT /api/auth/update-profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, updateProfile };