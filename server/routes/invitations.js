const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  respondToInvitation,
  getMyInvitations,
} = require('../controllers/invitationController');
const { protect } = require('../middlewares/auth');

// Trip invitations (nested under trips)
const invitationRouter = express.Router({ mergeParams: true });
invitationRouter.post('/', protect, sendInvitation);

// Global invitations
router.get('/', protect, getMyInvitations);
router.put('/:token', protect, respondToInvitation);

module.exports = { invitationRouter, router };
