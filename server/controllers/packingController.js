const PackingList = require('../models/PackingList');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get packing list for a trip
// @route   GET /api/trips/:tripId/packing
// @access  Private
exports.getPackingList = asyncHandler(async (req, res, next) => {
  const packingList = await PackingList.findOne({ trip: req.params.tripId })
    .populate('items.addedBy', 'name email avatar')
    .populate('items.assignedTo', 'name email avatar');

  if (!packingList) {
    return res.status(200).json({
      success: true,
      data: { items: [], progress: 0 },
    });
  }

  res.status(200).json({
    success: true,
    data: packingList,
  });
});

// @desc    Create or update packing list
// @route   PUT /api/trips/:tripId/packing
// @access  Private
exports.upsertPackingList = asyncHandler(async (req, res, next) => {
  const { name, items } = req.body;

  const packingList = await PackingList.findOneAndUpdate(
    { trip: req.params.tripId },
    {
      trip: req.params.tripId,
      name: name || 'Packing List',
      items: items || [],
      createdBy: req.user.id,
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: packingList,
  });
});

// @desc    Add item to packing list
// @route   POST /api/trips/:tripId/packing/items
// @access  Private
exports.addItem = asyncHandler(async (req, res, next) => {
  let packingList = await PackingList.findOne({ trip: req.params.tripId });

  if (!packingList) {
    packingList = await PackingList.create({
      trip: req.params.tripId,
      name: 'Packing List',
      items: [],
      createdBy: req.user.id,
    });
  }

  packingList.items.push({
    ...req.body,
    addedBy: req.user.id,
  });

  await packingList.save();

  res.status(201).json({
    success: true,
    data: packingList,
  });
});

// @desc    Update packing item
// @route   PUT /api/trips/:tripId/packing/items/:itemId
// @access  Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  const packingList = await PackingList.findOne({ trip: req.params.tripId });

  if (!packingList) {
    return next(new ErrorResponse('No packing list found for this trip', 404));
  }

  const item = packingList.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }

  Object.assign(item, req.body);
  await packingList.save();

  res.status(200).json({
    success: true,
    data: packingList,
  });
});

// @desc    Toggle item check
// @route   PUT /api/trips/:tripId/packing/items/:itemId/toggle
// @access  Private
exports.toggleItem = asyncHandler(async (req, res, next) => {
  const packingList = await PackingList.findOne({ trip: req.params.tripId });

  if (!packingList) {
    return next(new ErrorResponse('No packing list found for this trip', 404));
  }

  const item = packingList.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }

  item.isChecked = !item.isChecked;
  await packingList.save();

  res.status(200).json({
    success: true,
    data: packingList,
  });
});

// @desc    Delete packing item
// @route   DELETE /api/trips/:tripId/packing/items/:itemId
// @access  Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const packingList = await PackingList.findOne({ trip: req.params.tripId });

  if (!packingList) {
    return next(new ErrorResponse('No packing list found for this trip', 404));
  }

  const item = packingList.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }

  item.deleteOne();
  await packingList.save();

  res.status(200).json({
    success: true,
    data: packingList,
  });
});
