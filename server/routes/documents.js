const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

router.get('/', protect, getDocuments);
router.post('/', protect, uploadSingle('document'), uploadDocument);

// Delete by document ID (not trip-scoped)
const deleteRouter = express.Router();
deleteRouter.delete('/:id', protect, deleteDocument);

module.exports = { router, deleteRouter };
