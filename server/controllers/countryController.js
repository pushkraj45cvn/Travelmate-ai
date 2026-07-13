const Country = require('../models/Country');
const City = require('../models/City');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get all countries (grouped by continent)
// @route   GET /api/countries
// @access  Pro/Team only
exports.getCountries = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  // Block free users
  if (userPlan === 'free') {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  // Build filter
  const filter = {};
  if (req.query.continent) filter.continent = req.query.continent;
  if (req.query.isPopular === 'true') filter.isPopular = true;

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
// @access  Pro/Team only
exports.getCountry = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  // Block free users
  if (userPlan === 'free') {
    return next(new ErrorResponse('Upgrade to Pro or Team plan to explore destinations', 403));
  }

  // Find by slug or ID
  const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.slug }
    : { slug: req.params.slug.toLowerCase() };

  const country = await Country.findOne(query);

  if (!country) {
    return next(new ErrorResponse('Country not found', 404));
  }

  // Get cities in this country
  const cities = await City.find({ country: country._id })
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
// @access  Pro/Team only
exports.getContinents = asyncHandler(async (req, res, next) => {
  const userPlan = req.user?.plan || 'free';

  // Block free users
  if (userPlan === 'free') {
    return res.status(200).json({ success: true, data: [] });
  }

  const continents = await Country.aggregate([
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
