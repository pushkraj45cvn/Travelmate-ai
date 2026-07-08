const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a document title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['passport', 'visa', 'flight_ticket', 'hotel_booking', 'insurance', 'other'],
      required: [true, 'Please select a document type'],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'image',
    },
    notes: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ trip: 1, type: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);
