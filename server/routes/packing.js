const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getPackingList,
  upsertPackingList,
  addItem,
  updateItem,
  toggleItem,
  deleteItem,
} = require('../controllers/packingController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getPackingList);
router.put('/', protect, upsertPackingList);
router.post('/items', protect, addItem);
router.put('/items/:itemId', protect, updateItem);
router.put('/items/:itemId/toggle', protect, toggleItem);
router.delete('/items/:itemId', protect, deleteItem);

module.exports = router;
