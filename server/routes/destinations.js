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

router.get('/', getDestinations);
router.get('/:id', getDestination);
router.get('/wishlist/me', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:destinationId', protect, removeFromWishlist);
router.post('/reviews', protect, createReview);

module.exports = router;
