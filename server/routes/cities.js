const express = require('express');
const router = express.Router();
const {
  getCities,
  getCity,
  getNearbyCities,
} = require('../controllers/cityController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getCities);
router.get('/nearby', protect, (req, res) => {
  res.status(400).json({ success: false, error: 'Please provide a city slug: /api/cities/:slug/nearby' });
});
router.get('/:slug', protect, getCity);
router.get('/:slug/nearby', protect, getNearbyCities);

module.exports = router;
