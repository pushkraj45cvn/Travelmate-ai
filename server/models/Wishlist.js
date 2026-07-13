const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destinations: [
      {
        destination: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'destinations.itemType',
        },
        itemType: {
          type: String,
          enum: ['Destination', 'City'],
          default: 'Destination',
        },
        notes: {
          type: String,
          default: '',
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ user: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
