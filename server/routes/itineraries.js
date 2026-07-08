const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getItinerary,
  upsertItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
} = require('../controllers/itineraryController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getItinerary);
router.put('/', protect, upsertItinerary);
router.post('/days/:dayNumber/activities', protect, addActivity);
router.put('/activities/:activityId', protect, updateActivity);
router.delete('/activities/:activityId', protect, deleteActivity);
router.put('/reorder', protect, reorderActivities);

module.exports = router;
