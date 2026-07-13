const express = require('express');
const router = express.Router();
const { subscribe, cancelSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/auth');

// POST /api/subscriptions/subscribe — Process payment & upgrade plan
router.post('/subscribe', protect, subscribe);

// POST /api/subscriptions/cancel — Cancel subscription (downgrade to free)
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
