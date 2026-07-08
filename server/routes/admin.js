const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllTrips,
  deleteAnyTrip,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/trips', getAllTrips);
router.delete('/trips/:id', deleteAnyTrip);
router.get('/analytics', getAnalytics);

module.exports = router;
