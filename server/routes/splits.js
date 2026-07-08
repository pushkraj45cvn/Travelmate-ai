const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getSplits,
  calculateSplits,
  settleDebt,
} = require('../controllers/expenseSplitController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getSplits);
router.post('/calculate', protect, calculateSplits);
router.post('/settle', protect, settleDebt);

module.exports = router;
