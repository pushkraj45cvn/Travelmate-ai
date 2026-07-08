const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: ['flights', 'hotels', 'food', 'shopping', 'fuel', 'transport', 'activities', 'miscellaneous'],
      required: [true, 'Please select a category'],
    },
    description: {
      type: String,
      default: '',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    receipt: {
      type: String,
      default: '',
    },
    receiptPublicId: {
      type: String,
      default: '',
    },
    splitAmong: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
        settled: {
          type: Boolean,
          default: false,
        },
      },
    ],
    splitType: {
      type: String,
      enum: ['equal', 'percentage', 'custom'],
      default: 'equal',
    },
    isGroupExpense: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ trip: 1, category: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
