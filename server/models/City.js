const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a city name'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Please add a country'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    images: [String],
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    bestTimeToVisit: String,
    estimatedBudget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isCapital: {
      type: Boolean,
      default: false,
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
        category: {
          type: String,
          enum: ['landmark', 'museum', 'nature', 'food', 'shopping', 'nightlife', 'other'],
          default: 'landmark',
        },
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
    travelTips: [String],
    weather: {
      temperature: String,
      condition: String,
      humidity: String,
    },
    funFact: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

citySchema.index({ country: 1, name: 1 });
citySchema.index({ slug: 1 });
citySchema.index({ isPremium: 1 });
citySchema.index({ isPopular: 1 });
citySchema.index({ 'coordinates': '2dsphere' });

// Create unique compound index: one city name per country
citySchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('City', citySchema);
