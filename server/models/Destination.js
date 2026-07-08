const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a destination name'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    images: [String],
    bestTimeToVisit: {
      type: String,
      default: '',
    },
    estimatedBudget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    attractions: [
      {
        name: String,
        description: String,
        image: String,
        location: {
          lat: Number,
          lng: Number,
        },
        rating: { type: Number, min: 0, max: 5 },
      },
    ],
    restaurants: [
      {
        name: String,
        cuisine: String,
        priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] },
        location: {
          lat: Number,
          lng: Number,
        },
        rating: { type: Number, min: 0, max: 5 },
      },
    ],
    hotels: [
      {
        name: String,
        type: { type: String, enum: ['budget', 'mid-range', 'luxury'] },
        pricePerNight: Number,
        location: {
          lat: Number,
          lng: Number,
        },
        rating: { type: Number, min: 0, max: 5 },
        amenities: [String],
      },
    ],
    weather: {
      temperature: String,
      condition: String,
      humidity: String,
    },
    travelTips: [String],
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'English',
    },
    timezone: String,
    isPopular: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

destinationSchema.index({ name: 'text', country: 'text', description: 'text' });
destinationSchema.index({ isPopular: 1 });
destinationSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

module.exports = mongoose.model('Destination', destinationSchema);
