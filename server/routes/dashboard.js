const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, getDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
