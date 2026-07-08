const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    bio: req.body.bio,
    country: req.body.country,
    preferredCurrency: req.body.preferredCurrency,
    preferredLanguage: req.body.preferredLanguage,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatar: req.file.path,
      avatarPublicId: req.file.filename,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get user travel history
// @route   GET /api/users/travel-history
// @access  Private
exports.getTravelHistory = asyncHandler(async (req, res, next) => {
  const Trip = require('../models/Trip');
  const trips = await Trip.find({
    $or: [
      { owner: req.user.id },
      { 'collaborators.user': req.user.id },
    ],
    status: 'completed',
  })
    .select('title destination country startDate endDate coverImage')
    .sort('-endDate');

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  });
});

// @desc    Get user achievements
// @route   GET /api/users/achievements
// @access  Private
exports.getAchievements = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('achievements badges');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Suspend user (Admin)
// @route   PUT /api/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Activate user (Admin)
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {},
  });
});
