const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    type: {
      type: String,
      enum: [
        'invitation_received',
        'invitation_accepted',
        'invitation_declined',
        'expense_added',
        'trip_updated',
        'reminder',
        'new_message',
        'comment_added',
        'photo_added',
        'settlement_due',
        'member_joined',
        'trip_completed',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ trip: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
