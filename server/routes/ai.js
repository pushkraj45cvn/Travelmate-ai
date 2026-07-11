const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getChatById,
  deleteChat,
  getSuggestions,
} = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

router.post('/chat', protect, sendMessage);
router.get('/chat', protect, getChatHistory);
router.get('/chat/:id', protect, getChatById);
router.delete('/chat/:id', protect, deleteChat);
router.post('/suggest', protect, getSuggestions);

module.exports = router;
