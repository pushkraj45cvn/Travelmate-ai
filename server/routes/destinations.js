const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  createReview,
} = require('../controllers/destinationController');
const { protect } = require('../middlewares/auth');
const { checkPlanAccess } = require('../middlewares/planAccess');

router.get('/', getDestinations);
router.get('/:id', getDestination);
router.get('/wishlist/me', protect, checkPlanAccess('pro', 'team'), getWishlist);
router.post('/wishlist', protect, checkPlanAccess('pro', 'team'), addToWishlist);
router.delete('/wishlist/:destinationId', protect, checkPlanAccess('pro', 'team'), removeFromWishlist);
router.post('/reviews', protect, createReview);

module.exports = router;
