const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const PackingList = require('../models/PackingList');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Upcoming trips (planning or ongoing)
  const upcomingTrips = await Trip.find({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    status: { $in: ['planning', 'ongoing'] },
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .sort('startDate')
    .limit(5);

  // Recent trips
  const recentTrips = await Trip.find({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .sort('-updatedAt')
    .limit(5);

  // Total trips
  const totalTrips = await Trip.countDocuments({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    isArchived: false,
  });

  // Completed trips
  const completedTrips = await Trip.countDocuments({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    status: 'completed',
  });

  // Budget overview - get all user's trips with budgets
  const tripsWithBudget = await Trip.find({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    isArchived: false,
  }).select('_id title destination budget currency');

  const tripIds = tripsWithBudget.map((t) => t._id);

  // Expenses per trip
  const expensesPerTrip = await Expense.aggregate([
    { $match: { trip: { $in: tripIds } } },
    { $group: { _id: '$trip', total: { $sum: '$amount' } } },
  ]);

  const budgetData = tripsWithBudget.map((trip) => {
    const expense = expensesPerTrip.find(
      (e) => e._id.toString() === trip._id.toString()
    );
    return {
      _id: trip._id,
      title: trip.title,
      destination: trip.destination,
      budget: trip.budget,
      currency: trip.currency,
      spent: expense?.total || 0,
      remaining: (trip.budget || 0) - (expense?.total || 0),
    };
  });

  // Expense summary
  const totalSpent = expensesPerTrip.reduce((sum, e) => sum + e.total, 0);
  const totalBudget = tripsWithBudget.reduce((sum, t) => sum + (t.budget || 0), 0);

  // Category breakdown
  const categoryBreakdown = await Expense.aggregate([
    { $match: { trip: { $in: tripIds } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ]);

  // Packing progress - get all packing lists for user's trips
  const packingLists = await PackingList.find({ trip: { $in: tripIds } });
  const totalItems = packingLists.reduce((sum, pl) => sum + pl.items.length, 0);
  const checkedItems = packingLists.reduce(
    (sum, pl) => sum + pl.items.filter((i) => i.isChecked).length,
    0
  );
  const packingProgress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Unread notifications count
  const unreadNotifications = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  // Upcoming events (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingEvents = await Trip.find({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
    ],
    startDate: { $gte: new Date(), $lte: thirtyDaysFromNow },
    isArchived: false,
  })
    .select('title destination startDate endDate travelType')
    .sort('startDate');

  // Monthly expenses (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        trip: { $in: tripIds },
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      upcomingTrips,
      recentTrips,
      stats: {
        totalTrips,
        completedTrips,
        totalBudget,
        totalSpent,
        packingProgress,
        unreadNotifications,
      },
      budgetOverview: budgetData,
      categoryBreakdown,
      monthlyExpenses,
      upcomingEvents,
    },
  });
});

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getAdminDashboard = asyncHandler(async (req, res, next) => {
  const User = require('../models/User');

  const totalUsers = await User.countDocuments();
  const totalTrips = await Trip.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isVerified: true });

  const usersByMonth = await User.aggregate([
    {
      $match: {
        createdAt: { $type: 'date' },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const tripsByStatus = await Trip.aggregate([
    { $match: { status: { $type: 'string' } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const tripsByCountry = await Trip.aggregate([
    { $match: { country: { $type: 'string' } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalTrips,
        activeUsers,
        verifiedUsers,
      },
      usersByMonth,
      tripsByStatus,
      tripsByCountry,
    },
  });
});
