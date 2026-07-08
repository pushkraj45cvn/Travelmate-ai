const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate, buildFilter, buildSearchQuery, buildSort } = require('../utils/helpers');

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;

  const trip = await Trip.create(req.body);

  res.status(201).json({
    success: true,
    data: trip,
  });
});

// @desc    Get all trips for current user
// @route   GET /api/trips
// @access  Private
exports.getTrips = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  // User can see their own trips and trips they're collaborating on
  const baseFilter = {
    $or: [
      { owner: req.user.id },
      { 'collaborators.user': req.user.id },
    ],
  };

  const filter = { ...baseFilter, ...buildFilter(req.query, ['status', 'travelType', 'country']) };
  const searchQuery = buildSearchQuery(req.query, ['title', 'destination', 'country']);
  const sort = buildSort(req.query);

  const finalFilter = { ...filter, ...searchQuery };

  const trips = await Trip.find(finalFilter)
    .populate('owner', 'name email avatar')
    .populate('collaborators.user', 'name email avatar')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Trip.countDocuments(finalFilter);

  res.status(200).json({
    success: true,
    count: trips.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: trips,
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('collaborators.user', 'name email avatar');

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  // Check access
  const isOwner = trip.owner._id.toString() === req.user.id;
  const isCollaborator = trip.collaborators.some(
    (c) => c.user._id.toString() === req.user.id
  );

  if (!isOwner && !isCollaborator && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this trip', 403));
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = asyncHandler(async (req, res, next) => {
  let trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  // Check ownership
  if (trip.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    // Check if user is editor
    const collaborator = trip.collaborators.find(
      (c) => c.user.toString() === req.user.id && c.role === 'editor'
    );
    if (!collaborator) {
      return next(new ErrorResponse('Not authorized to update this trip', 403));
    }
  }

  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  // Check ownership
  if (trip.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this trip', 403));
  }

  await trip.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Duplicate trip
// @route   POST /api/trips/:id/duplicate
// @access  Private
exports.duplicateTrip = asyncHandler(async (req, res, next) => {
  const originalTrip = await Trip.findById(req.params.id);

  if (!originalTrip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  // Check access
  const hasAccess =
    originalTrip.owner.toString() === req.user.id ||
    originalTrip.collaborators.some((c) => c.user.toString() === req.user.id);

  if (!hasAccess && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to duplicate this trip', 403));
  }

  const tripData = originalTrip.toObject();
  delete tripData._id;
  delete tripData.createdAt;
  delete tripData.updatedAt;
  delete tripData.collaborators;

  tripData.title = `${tripData.title} (Copy)`;
  tripData.owner = req.user.id;
  tripData.status = 'planning';

  const newTrip = await Trip.create(tripData);

  res.status(201).json({
    success: true,
    data: newTrip,
  });
});

// @desc    Archive trip
// @route   PUT /api/trips/:id/archive
// @access  Private
exports.archiveTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  if (trip.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to archive this trip', 403));
  }

  trip.isArchived = !trip.isArchived;
  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Update trip status
// @route   PUT /api/trips/:id/status
// @access  Private
exports.updateTripStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  if (trip.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update trip status', 403));
  }

  trip.status = status;
  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Add collaborator to trip
// @route   POST /api/trips/:id/collaborators
// @access  Private
exports.addCollaborator = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  if (trip.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Only the trip owner can add collaborators', 403));
  }

  const { userId, role } = req.body;

  // Check if already a collaborator
  const alreadyExists = trip.collaborators.some(
    (c) => c.user.toString() === userId
  );

  if (alreadyExists) {
    return next(new ErrorResponse('User is already a collaborator', 400));
  }

  trip.collaborators.push({
    user: userId,
    role: role || 'viewer',
    joinedAt: Date.now(),
  });

  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Remove collaborator from trip
// @route   DELETE /api/trips/:id/collaborators/:userId
// @access  Private
exports.removeCollaborator = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.id}`, 404));
  }

  if (trip.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Only the trip owner can remove collaborators', 403));
  }

  trip.collaborators = trip.collaborators.filter(
    (c) => c.user.toString() !== req.params.userId
  );

  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});
