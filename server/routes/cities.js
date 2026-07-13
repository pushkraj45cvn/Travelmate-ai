const express = require('express');
const router = express.Router();
const {
  getCities,
  getCity,
  getNearbyCities,
} = require('../controllers/cityController');

router.get('/', getCities);
router.get('/nearby', (req, res) => {
  res.status(400).json({ success: false, error: 'Please provide a city slug: /api/cities/:slug/nearby' });
});
router.get('/:slug', getCity);
router.get('/:slug/nearby', getNearbyCities);

module.exports = router;
