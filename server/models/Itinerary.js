const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an activity title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  time: {
    type: String,
    required: [true, 'Please add a time'],
  },
  cost: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  notes: {
    type: String,
    default: '',
  },
  location: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
  },
  category: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: [true, 'Please add a time category'],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const daySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  activities: [activitySchema],
  notes: {
    type: String,
    default: '',
  },
});

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    days: [daySchema],
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

itinerarySchema.index({ trip: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
