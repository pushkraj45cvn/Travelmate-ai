const mongoose = require('mongoose');

const packingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  category: {
    type: String,
    enum: ['clothes', 'electronics', 'medicines', 'documents', 'toiletries', 'accessories', 'other'],
    default: 'other',
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  notes: {
    type: String,
    default: '',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const packingListSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    name: {
      type: String,
      default: 'Packing List',
    },
    items: [packingItemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

packingListSchema.index({ trip: 1 });

// Virtual for packing progress
packingListSchema.virtual('progress').get(function () {
  if (this.items.length === 0) return 0;
  const checked = this.items.filter((item) => item.isChecked).length;
  return Math.round((checked / this.items.length) * 100);
});

packingListSchema.set('toJSON', { virtuals: true });
packingListSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PackingList', packingListSchema);
