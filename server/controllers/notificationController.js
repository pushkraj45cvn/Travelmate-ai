const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = { recipient: req.user.id };
  if (req.query.unread === 'true') {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .populate('sender', 'name email avatar')
    .populate('trip', 'title destination')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    pages: Math.ceil(total / limit),
    page,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
