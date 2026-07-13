const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { sendEmail } = require('../config/nodemailer');

// @desc    Send invitation
// @route   POST /api/trips/:tripId/invitations
// @access  Private
exports.sendInvitation = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return next(new ErrorResponse(`Trip not found with id ${req.params.tripId}`, 404));
  }

  if (trip.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Only the trip owner can send invitations', 403));
  }

  const { email, role } = req.body;

  // Check if user exists
  const invitedUser = await User.findOne({ email });

  // Check if already a collaborator
  const alreadyCollab = trip.collaborators.some(
    (c) => c.user.toString() === invitedUser?._id.toString()
  );

  if (alreadyCollab) {
    return next(new ErrorResponse('User is already a collaborator', 400));
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await Invitation.create({
    trip: req.params.tripId,
    invitedBy: req.user.id,
    invitedEmail: email,
    invitedUser: invitedUser?._id,
    role: role || 'viewer',
    token,
    expiresAt,
  });

  // Send invitation email
  const inviteUrl = `${process.env.CLIENT_URL}/invitations/${token}`;

  try {
    await sendEmail({
      email,
      subject: `Trip Invitation - ${trip.title}`,
      html: `
        <h1>You're Invited!</h1>
        <p>${req.user.name} has invited you to join the trip <strong>${trip.title}</strong> to ${trip.destination}.</p>
        <p>Role: ${role || 'Viewer'}</p>
        <a href="${inviteUrl}" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
          View Invitation
        </a>
        <p>This invitation expires in 7 days.</p>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }

  // Create in-app notification for the invited user
  if (invitedUser) {
    try {
      await Notification.create({
        recipient: invitedUser._id,
        sender: req.user.id,
        trip: trip._id,
        type: 'invitation_received',
        title: `Trip Invitation`,
        message: `${req.user.name} invited you to join "${trip.title}"`,
        actionUrl: '/invitations',
      });
    } catch (err) {
      console.error('Notification creation failed:', err);
    }
  }

  res.status(201).json({
    success: true,
    data: invitation,
  });
});

// @desc    Accept/Decline invitation
// @route   PUT /api/invitations/:token
// @access  Private
exports.respondToInvitation = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // 'accepted' or 'declined'

  const invitation = await Invitation.findOne({ token: req.params.token });

  if (!invitation) {
    return next(new ErrorResponse('Invalid invitation token', 404));
  }

  if (invitation.status !== 'pending') {
    return next(new ErrorResponse('Invitation has already been responded to', 400));
  }

  if (invitation.expiresAt < Date.now()) {
    invitation.status = 'expired';
    await invitation.save();
    return next(new ErrorResponse('Invitation has expired', 400));
  }

  invitation.status = status;
  invitation.respondedAt = Date.now();
  await invitation.save();

  if (status === 'accepted') {
    const trip = await Trip.findById(invitation.trip);
    if (trip) {
      const alreadyCollab = trip.collaborators.some(
        (c) => c.user.toString() === req.user.id
      );
      if (!alreadyCollab) {
        trip.collaborators.push({
          user: req.user.id,
          role: invitation.role,
          joinedAt: Date.now(),
        });
        await trip.save();
      }
    }

    // Notify the trip owner that invitation was accepted
    try {
      await Notification.create({
        recipient: invitation.invitedBy,
        sender: req.user.id,
        trip: invitation.trip,
        type: 'invitation_accepted',
        title: 'Invitation Accepted',
        message: `${req.user.name} accepted your invitation to join "${trip?.title || 'the trip'}"`,
        actionUrl: `/trips/${invitation.trip}`,
      });
    } catch (err) {
      console.error('Notification creation failed:', err);
    }
  } else if (status === 'declined') {
    // Notify the trip owner that invitation was declined
    try {
      const trip = await Trip.findById(invitation.trip);
      await Notification.create({
        recipient: invitation.invitedBy,
        sender: req.user.id,
        trip: invitation.trip,
        type: 'invitation_declined',
        title: 'Invitation Declined',
        message: `${req.user.name} declined your invitation to join "${trip?.title || 'the trip'}"`,
        actionUrl: '/invitations',
      });
    } catch (err) {
      console.error('Notification creation failed:', err);
    }
  }

  res.status(200).json({
    success: true,
    data: invitation,
  });
});

// @desc    Get pending invitations for current user
// @route   GET /api/invitations
// @access  Private
exports.getMyInvitations = asyncHandler(async (req, res, next) => {
  let filter;

  if (req.query.sent === 'true') {
    // Return invitations sent by the current user
    filter = { invitedBy: req.user.id };
  } else {
    // Return invitations received by the current user
    filter = {
      $or: [
        { invitedEmail: req.user.email },
        { invitedUser: req.user.id },
      ],
    };
  }

  const invitations = await Invitation.find(filter)
    .populate('trip', 'title destination country startDate endDate coverImage')
    .populate('invitedBy', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations,
  });
});
