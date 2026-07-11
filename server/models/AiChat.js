const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    context: {
      destination: String,
      country: String,
      travelType: String,
      duration: Number,
      budget: Number,
    },
  },
  {
    timestamps: true,
  }
);

aiChatSchema.index({ user: 1 });
aiChatSchema.index({ user: 1, trip: 1 });

module.exports = mongoose.model('AiChat', aiChatSchema);
