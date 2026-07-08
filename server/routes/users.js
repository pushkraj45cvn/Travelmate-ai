const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
  deleteAccount,
  getTravelHistory,
  getAchievements,
  suspendUser,
  activateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/profile', protect, (req, res, next) => {
  req.params.id = req.user.id;
  getUser(req, res, next);
});
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, uploadSingle('avatar'), updateAvatar);
router.delete('/profile', protect, deleteAccount);
router.get('/travel-history', protect, getTravelHistory);
router.get('/achievements', protect, getAchievements);
router.put('/:id/suspend', protect, authorize('admin'), suspendUser);
router.put('/:id/activate', protect, authorize('admin'), activateUser);
router.get('/:id', protect, authorize('admin'), getUser);

module.exports = router;
