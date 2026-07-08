const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate, buildSearchQuery } = require('../utils/helpers');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = {};
  if (req.query.isPopular === 'true') filter.isPopular = true;

  const searchQuery = buildSearchQuery(req.query, ['name', 'country', 'description']);
  const finalFilter = { ...filter, ...searchQuery };

  const destinations = await Destination.find(finalFilter)
    .skip(skip)
    .limit(limit)
    .sort(req.query.sort || '-isPopular');

  const total = await Destination.countDocuments(finalFilter);

  res.status(200).json({
    success: true,
    count: destinations.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: destinations,
  });
});

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(new ErrorResponse(`Destination not found with id ${req.params.id}`, 404));
  }

  // Get reviews
  const reviews = await Review.find({ destination: req.params.id })
    .populate('user', 'name email avatar')
    .sort('-createdAt');

  // Get average rating
  const avgRating = await Review.aggregate([
    { $match: { destination: new mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...destination.toObject(),
      reviews,
      rating: avgRating[0] || { average: 0, count: 0 },
    },
  });
});

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('destinations.destination');

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: { destinations: [] },
    });
  }

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { destinationId, notes, priority } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      destinations: [],
    });
  }

  // Check if already in wishlist
  const exists = wishlist.destinations.some(
    (d) => d.destination.toString() === destinationId
  );

  if (exists) {
    return next(new ErrorResponse('Destination already in wishlist', 400));
  }

  wishlist.destinations.push({
    destination: destinationId,
    notes: notes || '',
    priority: priority || 'medium',
  });

  await wishlist.save();

  res.status(201).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:destinationId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.destinations = wishlist.destinations.filter(
    (d) => d.destination.toString() !== req.params.destinationId
  );

  await wishlist.save();

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});
