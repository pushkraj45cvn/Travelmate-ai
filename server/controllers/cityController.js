const City = require('../models/City');
const Country = require('../models/Country');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
exports.getCities = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const userPlan = req.user?.plan || 'free';

  const filter = {};
  if (req.query.country) filter.country = req.query.country;
  if (req.query.isPopular === 'true') filter.isPopular = true;
  if (req.query.isCapital === 'true') filter.isCapital = true;

  // Text search
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  // Plan filtering
  if (userPlan === 'free') {
    filter.isPremium = { $ne: true };
  }

  const cities = await City.find(filter)
    .populate('country', 'name slug flag code continent isPremium')
    .skip(skip)
    .limit(limit)
    .sort(req.query.sort || '-isPopular name');

  const total = await City.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: cities.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: cities,
  });
});

// @desc    Get single city by slug or ID
// @route   GET /api/cities/:slug
// @access  Public
exports.getCity = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.slug }
    : { slug: req.params.slug.toLowerCase() };

  const city = await City.findOne(query).populate('country', 'name slug flag code continent currency isPremium timezone');

  if (!city) {
    return next(new ErrorResponse('City not found', 404));
  }

  // Check premium access
  const country = city.country;
  if ((city.isPremium || country?.isPremium) && userPlan === 'free') {
    return next(
      new ErrorResponse('Upgrade to Pro or Team plan to explore this city', 403)
    );
  }

  // Get reviews for this city's attractions
  const reviews = await Review.find({ city: city._id })
    .populate('user', 'name email avatar')
    .sort('-createdAt');

  // Get average rating
  const avgRating = await Review.aggregate([
    { $match: { city: new mongoose.Types.ObjectId(city._id) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...city.toObject(),
      reviews,
      rating: avgRating[0] || { average: 0, count: 0 },
    },
  });
});

// @desc    Get nearby cities
// @route   GET /api/cities/:slug/nearby
// @access  Public
exports.getNearbyCities = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.slug }
    : { slug: req.params.slug.toLowerCase() };

  const city = await City.findOne(query);
  if (!city) return next(new ErrorResponse('City not found', 404));

  const filter = {
    _id: { $ne: city._id },
    country: city.country,
    'coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [city.coordinates.lng, city.coordinates.lat] },
        $maxDistance: 500000, // 500km
      },
    },
  };
  if (userPlan === 'free') filter.isPremium = { $ne: true };

  const nearby = await City.find(filter)
    .limit(6)
    .select('name slug description images coordinates isPremium isPopular');

  res.status(200).json({
    success: true,
    count: nearby.length,
    data: nearby,
  });
});
