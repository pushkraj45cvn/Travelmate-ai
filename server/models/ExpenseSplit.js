const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  isSettled: {
    type: Boolean,
    default: false,
  },
  settledAt: {
    type: Date,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
});

const expenseSplitSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        totalPaid: {
          type: Number,
          default: 0,
        },
        totalShare: {
          type: Number,
          default: 0,
        },
        balance: {
          type: Number,
          default: 0,
        },
      },
    ],
    settlements: [settlementSchema],
    totalExpenses: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

expenseSplitSchema.index({ trip: 1 });
expenseSplitSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('ExpenseSplit', expenseSplitSchema);
