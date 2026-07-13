const express = require('express');
const router = express.Router();
const {
  getCountries,
  getCountry,
  getContinents,
} = require('../controllers/countryController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getCountries);
router.get('/continents', protect, getContinents);
router.get('/:slug', protect, getCountry);

module.exports = router;
