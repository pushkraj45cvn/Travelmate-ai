const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { paginate } = require('../utils/helpers');

// @desc    Get or create chat for a trip
// @route   GET /api/trips/:tripId/chat
// @access  Private
exports.getOrCreateChat = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.tripId}`, 404));
  }

  let chat = await Chat.findOne({ trip: req.params.tripId })
    .populate('participants', 'name email avatar');

  if (!chat) {
    // Collect all participants
    const participantIds = [
      trip.owner,
      ...trip.collaborators.map((c) => c.user),
    ];

    chat = await Chat.create({
      trip: req.params.tripId,
      participants: participantIds,
    });

    chat = await Chat.findById(chat._id).populate('participants', 'name email avatar');
  }

  res.status(200).json({
    success: true,
    data: chat,
  });
});

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name email avatar')
    .populate('readBy.user', 'name email avatar')
    .skip(skip)
    .limit(limit)
    .sort('-createdAt');

  const total = await Message.countDocuments({ chat: req.params.chatId });

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    data: messages.reverse(),
  });
});

// @desc    Send a message
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    return next(new ErrorResponse('Chat not found', 404));
  }

  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user.id,
    content: req.body.content,
    messageType: req.body.messageType || 'text',
    fileUrl: req.body.fileUrl || '',
    fileName: req.body.fileName || '',
  });

  // Update chat's last message
  chat.lastMessage = {
    content: req.body.content,
    sender: req.user.id,
    timestamp: Date.now(),
  };
  await chat.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email avatar');

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { messageIds } = req.body;

  await Message.updateMany(
    { _id: { $in: messageIds } },
    {
      $addToSet: {
        readBy: { user: req.user.id, readAt: Date.now() },
      },
    }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});
