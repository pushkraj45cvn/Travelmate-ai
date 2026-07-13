const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Create expense
// @route   POST /api/trips/:tripId/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.tripId}`, 404));
  }

  req.body.trip = req.params.tripId;
  req.body.paidBy = req.user.id;

  const expense = await Expense.create(req.body);

  res.status(201).json({
    success: true,
    data: expense,
  });
});

// @desc    Get all expenses for a trip
// @route   GET /api/trips/:tripId/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = { trip: req.params.tripId };
  if (req.query.category) filter.category = req.query.category;

  const expenses = await Expense.find(filter)
    .populate('paidBy', 'name email avatar')
    .populate('splitAmong.user', 'name email avatar')
    .skip(skip)
    .limit(limit)
    .sort('-date');

  const total = await Expense.countDocuments(filter);

  // Calculate totals by category
  const categoryTotals = await Expense.aggregate([
    { $match: { trip: require('mongoose').Types.ObjectId(req.params.tripId) } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  res.status(200).json({
    success: true,
    count: expenses.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    totalExpenses,
    categoryTotals,
    data: expenses,
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name email avatar')
    .populate('splitAmong.user', 'name email avatar');

  if (!expense) {
    return next(new ErrorResponse(`Expense not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res, next) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new ErrorResponse(`Expense not found with id ${req.params.id}`, 404));
  }

  if (expense.paidBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this expense', 403));
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new ErrorResponse(`Expense not found with id ${req.params.id}`, 404));
  }

  if (expense.paidBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this expense', 403));
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get expense summary for trip
// @route   GET /api/trips/:tripId/expenses/summary
// @access  Private
exports.getExpenseSummary = asyncHandler(async (req, res, next) => {
  const tripId = req.params.tripId;

  const totalExpenses = await Expense.aggregate([
    { $match: { trip: require('mongoose').Types.ObjectId(tripId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const byCategory = await Expense.aggregate([
    { $match: { trip: require('mongoose').Types.ObjectId(tripId) } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const byUser = await Expense.aggregate([
    { $match: { trip: require('mongoose').Types.ObjectId(tripId) } },
    { $group: { _id: '$paidBy', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const monthlyExpenses = await Expense.aggregate([
    { $match: { trip: require('mongoose').Types.ObjectId(tripId) } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Recent expenses for display on trip detail
  const recent = await Expense.find({ trip: tripId })
    .sort('-createdAt')
    .limit(5)
    .populate('paidBy', 'name')
    .lean();

  const trip = await Trip.findById(tripId);

  res.status(200).json({
    success: true,
    data: {
      total: totalExpenses[0]?.total || 0,
      budget: trip?.budget || 0,
      remaining: (trip?.budget || 0) - (totalExpenses[0]?.total || 0),
      byCategory,
      byUser,
      monthly: monthlyExpenses,
      recent,
    },
  });
});
