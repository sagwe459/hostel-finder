// controllers/listingController.js
const Listing = require('../models/Listing');
const User    = require('../models/User');
const fs      = require('fs');
const path    = require('path');

const buildImageUrl   = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/${filename}`;
const deleteImageFile = (imageUrl) => {
  try {
    const filename = imageUrl.split('/uploads/')[1];
    if (!filename) return;
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) { console.error('Image delete error:', err.message); }
};

// GET /api/listings
const getListings = async (req, res, next) => {
  try {
    const {
      keyword, location, minPrice, maxPrice,
      amenities, type, available,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const query = {};
    if (keyword)   query.$text = { $search: keyword };
    if (location)  query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (amenities) query.amenities = { $all: amenities.split(',').map((a) => a.trim()) };
    if (type)      query.type = type;
    if (available !== undefined) query.isAvailable = available === 'true';

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));
    const skip     = (pageNum - 1) * limitNum;
    const total    = await Listing.countDocuments(query);

    const listings = await Listing.find(query)
      .populate('landlord', 'name email phone avatar')
      .sort(sort).skip(skip).limit(limitNum).lean();

    res.status(200).json({
      success: true, total,
      page: pageNum, pages: Math.ceil(total / limitNum),
      count: listings.length, listings,
    });
  } catch (error) { next(error); }
};

// GET /api/listings/:id
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', 'name email phone avatar createdAt')
      .populate('reviews.user', 'name avatar');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    res.status(200).json({ success: true, listing });
  } catch (error) { next(error); }
};

// POST /api/listings
const createListing = async (req, res, next) => {
  try {
    const {
      title, description, price, location,
      lat, lng, amenities, type,
      totalUnits, availableUnits,
    } = req.body;

    const imageUrls = (req.files || []).map((f) => buildImageUrl(req, f.filename));

    let parsedAmenities = [];
    if (amenities) {
      try { parsedAmenities = JSON.parse(amenities); }
      catch { parsedAmenities = amenities.split(',').map((a) => a.trim()).filter(Boolean); }
    }

    const total = Number(totalUnits) || 1;
    const avail = availableUnits !== undefined ? Number(availableUnits) : total;

    const listing = await Listing.create({
      title, description,
      price: Number(price),
      location,
      coordinates: {
        latitude:  lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
      },
      images:         imageUrls,
      amenities:      parsedAmenities,
      type:           type || 'bedsitter',
      landlord:       req.user._id,
      totalUnits:     total,
      availableUnits: avail,
      isAvailable:    avail > 0,
    });

    await listing.populate('landlord', 'name email phone');
    res.status(201).json({ success: true, listing });
  } catch (error) { next(error); }
};

// PUT /api/listings/:id
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const {
      title, description, price, location,
      lat, lng, amenities, type, isAvailable,
      keepImages, totalUnits, availableUnits,
    } = req.body;

    let keptImages = [];
    if (keepImages) { try { keptImages = JSON.parse(keepImages); } catch { keptImages = []; } }

    listing.images.forEach((url) => { if (!keptImages.includes(url)) deleteImageFile(url); });

    const newImageUrls = (req.files || []).map((f) => buildImageUrl(req, f.filename));
    const finalImages  = [...keptImages, ...newImageUrls];

    let parsedAmenities = listing.amenities;
    if (amenities !== undefined) {
      try { parsedAmenities = JSON.parse(amenities); }
      catch { parsedAmenities = amenities.split(',').map((a) => a.trim()).filter(Boolean); }
    }

    // Resolve units
    const newTotal = totalUnits !== undefined ? Number(totalUnits) : listing.totalUnits;
    const newAvail = availableUnits !== undefined ? Number(availableUnits) : listing.availableUnits;
    const newIsAvailable = newAvail > 0;

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title, description,
        price:          price ? Number(price) : listing.price,
        location,
        coordinates: {
          latitude:  lat  ? Number(lat)  : listing.coordinates?.latitude,
          longitude: lng  ? Number(lng)  : listing.coordinates?.longitude,
        },
        images:         finalImages,
        amenities:      parsedAmenities,
        type:           type           || listing.type,
        totalUnits:     newTotal,
        availableUnits: newAvail,
        isAvailable:    newIsAvailable,
      },
      { new: true, runValidators: true }
    ).populate('landlord', 'name email phone');

    res.status(200).json({ success: true, listing });
  } catch (error) { next(error); }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    listing.images.forEach(deleteImageFile);
    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted.' });
  } catch (error) { next(error); }
};

// GET /api/listings/landlord/my-listings
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ landlord: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) { next(error); }
};

// POST /api/listings/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    const alreadyReviewed = listing.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed.' });
    listing.reviews.push({ user: req.user._id, userName: req.user.name, rating: Number(rating), comment });
    listing.calculateAverageRating();
    await listing.save();
    res.status(201).json({ success: true, message: 'Review added.', listing });
  } catch (error) { next(error); }
};

// POST /api/listings/:id/save
const toggleSaveListing = async (req, res, next) => {
  try {
    const user      = await User.findById(req.user._id);
    const listingId = req.params.id;
    const alreadySaved = user.savedListings.includes(listingId);
    if (alreadySaved) {
      user.savedListings = user.savedListings.filter((id) => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }
    await user.save();
    res.status(200).json({
      success: true,
      saved:   !alreadySaved,
      message: alreadySaved ? 'Listing removed from saved.' : 'Listing saved.',
      savedListings: user.savedListings,
    });
  } catch (error) { next(error); }
};

module.exports = {
  getListings, getListingById, createListing, updateListing,
  deleteListing, getMyListings, addReview, toggleSaveListing,
};