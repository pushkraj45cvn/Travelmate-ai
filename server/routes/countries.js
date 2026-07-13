const express = require('express');
const router = express.Router();
const {
  getCountries,
  getCountry,
  getContinents,
} = require('../controllers/countryController');

router.get('/', getCountries);
router.get('/continents', getContinents);
router.get('/:slug', getCountry);

module.exports = router;
