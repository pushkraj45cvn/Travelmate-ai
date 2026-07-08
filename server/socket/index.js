const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join trip room
    socket.on('join-trip', (tripId) => {
      socket.join(`trip:${tripId}`);
      console.log(`User ${socket.userId} joined trip ${tripId}`);
    });

    // Leave trip room
    socket.on('leave-trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, messageType, fileUrl, fileName } = data;

        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
          fileName: fileName || '',
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            content,
            sender: socket.userId,
            timestamp: Date.now(),
          },
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        // Get chat to know which trip
        const chat = await Chat.findById(chatId);

        // Broadcast to all users in the trip
        io.to(`trip:${chat.trip}`).emit('new-message', populatedMessage);
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ tripId, userName }) => {
      socket.to(`trip:${tripId}`).emit('user-typing', {
        userId: socket.userId,
        userName,
      });
    });

    socket.on('stop-typing', ({ tripId }) => {
      socket.to(`trip:${tripId}`).emit('user-stop-typing', {
        userId: socket.userId,
      });
    });

    // Notification
    socket.on('send-notification', async (data) => {
      try {
        const notification = await Notification.create({
          recipient: data.recipientId,
          sender: socket.userId,
          trip: data.tripId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
        });

        io.to(`user:${data.recipientId}`).emit('new-notification', notification);
      } catch (error) {
        console.error('Notification error:', error);
      }
    });

    // Trip update notification
    socket.on('trip-updated', ({ tripId, updatedBy }) => {
      socket.to(`trip:${tripId}`).emit('trip-changed', {
        tripId,
        updatedBy,
        timestamp: new Date(),
      });
    });

    // Expense update
    socket.on('expense-added', ({ tripId, expense }) => {
      socket.to(`trip:${tripId}`).emit('new-expense', expense);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
