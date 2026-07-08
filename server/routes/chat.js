const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getOrCreateChat,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getOrCreateChat);
router.get('/:chatId/messages', protect, getMessages);
router.post('/:chatId/messages', protect, sendMessage);
router.put('/:chatId/read', protect, markAsRead);

module.exports = router;
