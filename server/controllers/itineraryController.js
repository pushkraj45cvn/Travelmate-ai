const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get itinerary for a trip
// @route   GET /api/trips/:tripId/itinerary
// @access  Private
exports.getItinerary = asyncHandler(async (req, res, next) => {
  const itinerary = await Itinerary.findOne({ trip: req.params.tripId });

  if (!itinerary) {
    return next(new ErrorResponse('No itinerary found for this trip', 404));
  }

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

// @desc    Create or update itinerary
// @route   PUT /api/trips/:tripId/itinerary
// @access  Private
exports.upsertItinerary = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.tripId}`, 404));
  }

  // Check access
  const hasAccess =
    trip.owner.toString() === req.user.id ||
    trip.collaborators.some(
      (c) => c.user.toString() === req.user.id && c.role === 'editor'
    );

  if (!hasAccess && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to modify itinerary', 403));
  }

  const { days } = req.body;

  const itinerary = await Itinerary.findOneAndUpdate(
    { trip: req.params.tripId },
    {
      trip: req.params.tripId,
      days,
      createdBy: req.user.id,
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

// @desc    Add activity to a day
// @route   POST /api/trips/:tripId/itinerary/days/:dayNumber/activities
// @access  Private
exports.addActivity = asyncHandler(async (req, res, next) => {
  const itinerary = await Itinerary.findOne({ trip: req.params.tripId });

  if (!itinerary) {
    return next(new ErrorResponse('No itinerary found for this trip', 404));
  }

  const day = itinerary.days.find((d) => d.dayNumber === parseInt(req.params.dayNumber));

  if (!day) {
    // Create the day if it doesn't exist
    itinerary.days.push({
      dayNumber: parseInt(req.params.dayNumber),
      date: req.body.date || new Date(),
      activities: [req.body],
    });
  } else {
    day.activities.push(req.body);
  }

  await itinerary.save();

  res.status(201).json({
    success: true,
    data: itinerary,
  });
});

// @desc    Update activity
// @route   PUT /api/trips/:tripId/itinerary/activities/:activityId
// @access  Private
exports.updateActivity = asyncHandler(async (req, res, next) => {
  const itinerary = await Itinerary.findOne({ trip: req.params.tripId });

  if (!itinerary) {
    return next(new ErrorResponse('No itinerary found for this trip', 404));
  }

  let found = false;
  for (const day of itinerary.days) {
    const activity = day.activities.id(req.params.activityId);
    if (activity) {
      Object.assign(activity, req.body);
      found = true;
      break;
    }
  }

  if (!found) {
    return next(new ErrorResponse('Activity not found', 404));
  }

  await itinerary.save();

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

// @desc    Delete activity
// @route   DELETE /api/trips/:tripId/itinerary/activities/:activityId
// @access  Private
exports.deleteActivity = asyncHandler(async (req, res, next) => {
  const itinerary = await Itinerary.findOne({ trip: req.params.tripId });

  if (!itinerary) {
    return next(new ErrorResponse('No itinerary found for this trip', 404));
  }

  let found = false;
  for (const day of itinerary.days) {
    const activity = day.activities.id(req.params.activityId);
    if (activity) {
      activity.deleteOne();
      found = true;
      break;
    }
  }

  if (!found) {
    return next(new ErrorResponse('Activity not found', 404));
  }

  await itinerary.save();

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

// @desc    Reorder activities (drag and drop)
// @route   PUT /api/trips/:tripId/itinerary/reorder
// @access  Private
exports.reorderActivities = asyncHandler(async (req, res, next) => {
  const { sourceDay, destinationDay, sourceIndex, destinationIndex, activityId } = req.body;

  const itinerary = await Itinerary.findOne({ trip: req.params.tripId });

  if (!itinerary) {
    return next(new ErrorResponse('No itinerary found for this trip', 404));
  }

  const srcDay = itinerary.days.find((d) => d.dayNumber === sourceDay);
  const destDay = itinerary.days.find((d) => d.dayNumber === destinationDay);

  if (!srcDay || !destDay) {
    return next(new ErrorResponse('Day not found', 404));
  }

  const [movedActivity] = srcDay.activities.splice(sourceIndex, 1);

  if (sourceDay === destinationDay) {
    destDay.activities.splice(destinationIndex, 0, movedActivity);
  } else {
    movedActivity.category = getCategoryForDay(destinationDay);
    destDay.activities.splice(destinationIndex, 0, movedActivity);
  }

  await itinerary.save();

  res.status(200).json({
    success: true,
    data: itinerary,
  });
});

function getCategoryForDay(day) {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}
