const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getGallery,
  uploadMedia,
  deleteMedia,
  createAlbum,
} = require('../controllers/galleryController');
const { protect } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

router.get('/', protect, getGallery);
router.post('/', protect, uploadSingle('media'), uploadMedia);
router.delete('/:mediaId', protect, deleteMedia);
router.post('/albums', protect, createAlbum);

module.exports = router;
