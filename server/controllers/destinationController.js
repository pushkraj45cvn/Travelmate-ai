const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate, buildSearchQuery } = require('../utils/helpers');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public (free users see only free destinations)
exports.getDestinations = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = {};
  if (req.query.isPopular === 'true') filter.isPopular = true;
  if (req.query.isPremium === 'true') filter.isPremium = true;
  if (req.query.isPremium === 'false') filter.isPremium = false;

  // Plan-based filtering: free users can't see premium destinations
  const userPlan = req.user?.plan || 'free';
  if (userPlan === 'free') {
    filter.isPremium = { $ne: true };
  }

  const searchQuery = buildSearchQuery(req.query, ['name', 'country', 'description']);
  const finalFilter = { ...filter, ...searchQuery };

  const destinations = await Destination.find(finalFilter)
    .skip(skip)
    .limit(limit)
    .sort(req.query.sort || '-isPremium -isPopular');

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
// @access  Public (premium destinations require pro/team)
exports.getDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(new ErrorResponse(`Destination not found with id ${req.params.id}`, 404));
  }

  // Check plan access for premium destinations
  const userPlan = req.user?.plan || 'free';
  if (destination.isPremium && userPlan === 'free') {
    return next(
      new ErrorResponse('Upgrade to Pro or Team plan to view this premium destination', 403)
    );
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
    .populate({
      path: 'destinations.destination',
      refPath: 'destinations.itemType',
    });

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: { destinations: [] },
    });
  }

  // Separate cities and destinations for frontend
  const enhancedDestinations = wishlist.destinations.map((item) => {
    const dest = item.destination;
    if (!dest) return item;
    // For cities, add country name if populated
    if (item.itemType === 'City' && dest.country && typeof dest.country === 'object') {
      return {
        ...item.toObject(),
        destination: {
          ...dest.toObject(),
          _type: 'City',
          countryName: dest.country?.name || '',
        },
      };
    }
    return {
      ...item.toObject(),
      destination: {
        ...dest.toObject(),
        _type: item.itemType || 'Destination',
      },
    };
  });

  res.status(200).json({
    success: true,
    data: {
      ...wishlist.toObject(),
      destinations: enhancedDestinations,
    },
  });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { destinationId, notes, priority, itemType } = req.body;

  if (!destinationId) {
    return next(new ErrorResponse('Please provide a destination ID', 400));
  }

  // Determine if this is a City or Destination
  const type = itemType || 'Destination';

  if (!['Destination', 'City'].includes(type)) {
    return next(new ErrorResponse('Invalid item type', 400));
  }

  // Verify the item exists
  const Model = type === 'City' ? require('../models/City') : require('../models/Destination');
  const item = await Model.findById(destinationId);
  if (!item) {
    return next(new ErrorResponse(`${type} not found`, 404));
  }

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
    return next(new ErrorResponse('Already in wishlist', 400));
  }

  wishlist.destinations.push({
    destination: destinationId,
    itemType: type,
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
