const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: [true, 'Please add an email'],
      lowercase: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: Date,
  },
  {
    timestamps: true,
  }
);

invitationSchema.index({ trip: 1, status: 1 });
invitationSchema.index({ invitedEmail: 1 });
invitationSchema.index({ token: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
