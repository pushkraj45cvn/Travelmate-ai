const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    images: [String],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ destination: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ trip: 1 });

// Prevent user from submitting more than one review per trip/destination
reviewSchema.index({ user: 1, trip: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, destination: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
