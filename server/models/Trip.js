const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a trip title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImagePublicId: {
      type: String,
      default: '',
    },
    budget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CNY', 'BRL', 'MXN'],
      default: 'USD',
    },
    travelType: {
      type: String,
      enum: ['solo', 'family', 'friends', 'couple', 'business', 'adventure', 'luxury', 'backpacking'],
      default: 'solo',
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    numberOfTravelers: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'completed', 'cancelled', 'archived'],
      default: 'planning',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['editor', 'viewer'],
          default: 'viewer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    destinationCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tripSchema.index({ owner: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'collaborators.user': 1 });
tripSchema.index({ destination: 'text', title: 'text', country: 'text' });
tripSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
