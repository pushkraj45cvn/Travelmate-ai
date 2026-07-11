const AiChat = require('../models/AiChat');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getOpenAIResponse, getRuleBasedResponse, generateTitle } = require('../services/aiService');

const HAS_OPENAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';

// @desc    Send message to AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message, tripId, context } = req.body;

  if (!message || !message.trim()) {
    return next(new ErrorResponse('Please provide a message', 400));
  }

  // Find or create AI chat session
  let aiChat;
  if (tripId) {
    aiChat = await AiChat.findOne({ user: req.user.id, trip: tripId });
  } else {
    aiChat = await AiChat.findOne({
      user: req.user.id,
      trip: null,
    }).sort('-updatedAt');
  }

  if (!aiChat) {
    aiChat = await AiChat.create({
      user: req.user.id,
      trip: tripId || null,
      messages: [],
      context: context || {},
    });
  }

  // Update context if provided
  if (context) {
    aiChat.context = { ...aiChat.context, ...context };
  }

  // Add user message
  aiChat.messages.push({
    role: 'user',
    content: message.trim(),
    createdAt: new Date(),
  });

  // Generate AI response
  let aiResponse;
  if (HAS_OPENAI) {
    aiResponse = await getOpenAIResponse(aiChat.messages, aiChat.context);
  } else {
    aiResponse = getRuleBasedResponse(aiChat.messages, aiChat.context);
  }

  // Add AI response
  aiChat.messages.push({
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date(),
  });

  // Auto-generate title from first message if only 2 messages
  if (aiChat.messages.length === 2) {
    aiChat.title = generateTitle(message);
  }

  await aiChat.save();

  res.status(200).json({
    success: true,
    data: {
      _id: aiChat._id,
      title: aiChat.title || 'TravelMate AI Chat',
      reply: aiResponse,
      messages: aiChat.messages.slice(-2),
    },
  });
});

// @desc    Get AI chat history
// @route   GET /api/ai/chat
// @access  Private
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { tripId } = req.query;

  const filter = { user: req.user.id };
  if (tripId) filter.trip = tripId;

  const chats = await AiChat.find(filter)
    .select('title trip context updatedAt messages')
    .sort('-updatedAt')
    .limit(20);

  const data = chats.map((chat) => ({
    _id: chat._id,
    title: chat.title || 'TravelMate AI Chat',
    tripId: chat.trip,
    context: chat.context,
    lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
    updatedAt: chat.updatedAt,
    messageCount: Math.floor(chat.messages.length / 2),
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get full conversation by chat ID
// @route   GET /api/ai/chat/:id
// @access  Private
exports.getChatById = asyncHandler(async (req, res, next) => {
  const chat = await AiChat.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!chat) {
    return next(new ErrorResponse('Chat not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: chat._id,
      title: chat.title || 'TravelMate AI Chat',
      messages: chat.messages,
      context: chat.context,
      tripId: chat.trip,
    },
  });
});

// @desc    Delete AI chat
// @route   DELETE /api/ai/chat/:id
// @access  Private
exports.deleteChat = asyncHandler(async (req, res, next) => {
  const chat = await AiChat.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!chat) {
    return next(new ErrorResponse('Chat not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get AI travel suggestions for a trip
// @route   POST /api/ai/suggest
// @access  Private
exports.getSuggestions = asyncHandler(async (req, res, next) => {
  const { destination, country, travelType, duration, budget, tripId } = req.body;

  const context = { destination, country, travelType, duration, budget };

  const prompt = `Give me travel suggestions for ${destination || 'my trip'}${country ? ` in ${country}` : ''}${travelType ? ` (${travelType} trip)` : ''}${duration ? ` for ${duration} days` : ''}${budget ? ` with a budget of $${budget}` : ''}. Include top attractions, local tips, and recommendations.`;

  let aiResponse;

  if (HAS_OPENAI) {
    aiResponse = await getOpenAIResponse([{ role: 'user', content: prompt }], context);
  } else {
    aiResponse = getRuleBasedResponse([{ role: 'user', content: prompt }], context);
  }

  // Save to chat if tripId provided
  if (tripId) {
    let aiChat = await AiChat.findOne({ user: req.user.id, trip: tripId });
    if (!aiChat) {
      aiChat = await AiChat.create({
        user: req.user.id,
        trip: tripId,
        messages: [],
        context,
      });
    }
    aiChat.context = { ...aiChat.context, ...context };
    aiChat.messages.push(
      { role: 'user', content: prompt, createdAt: new Date() },
      { role: 'assistant', content: aiResponse, createdAt: new Date() }
    );
    if (!aiChat.title) aiChat.title = generateTitle(prompt);
    await aiChat.save();
  }

  res.status(200).json({
    success: true,
    data: {
      suggestions: aiResponse,
      destination,
      country,
    },
  });
});
