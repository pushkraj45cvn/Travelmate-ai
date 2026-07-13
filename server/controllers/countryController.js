const Country = require('../models/Country');
const City = require('../models/City');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get all countries (grouped by continent)
// @route   GET /api/countries
// @access  Public
exports.getCountries = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  // Build filter
  const filter = {};
  if (req.query.continent) filter.continent = req.query.continent;
  if (req.query.isPopular === 'true') filter.isPopular = true;

  // Plan-based filtering
  if (userPlan === 'free') {
    filter.isPremium = { $ne: true };
  }

  const countries = await Country.find(filter)
    .sort(req.query.sort || '-isPopular name')
    .select('-__v');

  // Update counts from actual data
  const countriesWithStats = await Promise.all(
    countries.map(async (country) => {
      const cityCount = await City.countDocuments({ country: country._id });
      return { ...country.toObject(), stats: { ...country.stats, cityCount } };
    })
  );

  // Group by continent if requested
  if (req.query.group === 'continent') {
    const grouped = {};
    for (const country of countriesWithStats) {
      const continent = country.continent || 'Other';
      if (!grouped[continent]) grouped[continent] = [];
      grouped[continent].push(country);
    }
    return res.status(200).json({
      success: true,
      data: grouped,
    });
  }

  res.status(200).json({
    success: true,
    count: countriesWithStats.length,
    data: countriesWithStats,
  });
});

// @desc    Get single country by slug or ID
// @route   GET /api/countries/:slug
// @access  Public
exports.getCountry = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  // Find by slug or ID
  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.slug }
    : { slug: req.params.slug.toLowerCase() };

  const country = await Country.findOne(query);

  if (!country) {
    return next(new ErrorResponse('Country not found', 404));
  }

  // Check premium access
  if (country.isPremium && userPlan === 'free') {
    return next(
      new ErrorResponse('Upgrade to Pro or Team plan to explore this country', 403)
    );
  }

  // Get cities in this country
  const cityFilter = { country: country._id };
  if (userPlan === 'free') cityFilter.isPremium = { $ne: true };

  const cities = await City.find(cityFilter)
    .sort('-isPopular name')
    .select('name slug description images coordinates isPremium isPopular isCapital estimatedBudget');

  res.status(200).json({
    success: true,
    data: {
      ...country.toObject(),
      cities,
      stats: {
        ...country.stats,
        cityCount: cities.length,
      },
    },
  });
});

// @desc    Get continents summary
// @route   GET /api/continents
// @access  Public
exports.getContinents = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  const filter = {};
  if (userPlan === 'free') filter.isPremium = { $ne: true };

  const continents = await Country.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$continent',
        countryCount: { $sum: 1 },
        countries: {
          $push: {
            name: '$name',
            slug: '$slug',
            flag: '$flag',
            code: '$code',
            isPremium: '$isPremium',
            isPopular: '$isPopular',
            description: '$description',
            coordinates: '$coordinates',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: continents,
  });
});
