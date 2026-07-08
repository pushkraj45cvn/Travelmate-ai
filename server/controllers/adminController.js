const User = require('../models/User');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: users,
  });
});

// @desc    Get all trips (Admin)
// @route   GET /api/admin/trips
// @access  Private/Admin
exports.getAllTrips = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const trips = await Trip.find(filter)
    .populate('owner', 'name email')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await Trip.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: trips.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: trips,
  });
});

// @desc    Delete any trip (Admin)
// @route   DELETE /api/admin/trips/:id
// @access  Private/Admin
exports.deleteAnyTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  await trip.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get analytics (Admin)
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  // Total stats
  const totalUsers = await User.countDocuments();
  const totalTrips = await Trip.countDocuments();
  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Users registered per month (last 12 months)
  const usersByMonth = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  // Trips by country
  const tripsByCountry = await Trip.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Trips by status
  const tripsByStatus = await Trip.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Expenses by category
  const expensesByCategory = await Expense.aggregate([
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalTrips,
        totalExpenses: totalExpenses[0]?.total || 0,
      },
      usersByMonth,
      tripsByCountry,
      tripsByStatus,
      expensesByCategory,
    },
  });
});
