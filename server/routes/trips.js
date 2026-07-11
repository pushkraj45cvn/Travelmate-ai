const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  archiveTrip,
  updateTripStatus,
  addCollaborator,
  removeCollaborator,
  addTripReview,
  getTripReview,
  getFeaturedReviews,
} = require('../controllers/tripController');
const { protect } = require('../middlewares/auth');
const { createTripValidator, updateTripValidator } = require('../validators/trip');
const { validate } = require('../validators/index');

// Public routes
router.get('/reviews/featured', getFeaturedReviews);

router.route('/')
  .post(protect, createTripValidator, validate, createTrip)
  .get(protect, getTrips);

router.route('/:id')
  .get(protect, getTrip)
  .put(protect, updateTripValidator, validate, updateTrip)
  .delete(protect, deleteTrip);

router.post('/:id/duplicate', protect, duplicateTrip);
router.put('/:id/archive', protect, archiveTrip);
router.put('/:id/status', protect, updateTripStatus);
router.post('/:id/collaborators', protect, addCollaborator);
router.delete('/:id/collaborators/:userId', protect, removeCollaborator);
router.post('/:id/review', protect, addTripReview);
router.get('/:id/review', protect, getTripReview);

module.exports = router;
