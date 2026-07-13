const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a country name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    continent: {
      type: String,
      required: true,
      enum: ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica'],
    },
    flag: {
      type: String,
      default: '',
    },
    code: {
      type: String, // ISO alpha-2 (e.g. 'FR', 'JP')
      unique: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    currency: {
      code: { type: String, default: 'USD' },
      symbol: { type: String, default: '$' },
      name: { type: String, default: 'US Dollar' },
    },
    languages: [String],
    capital: String,
    description: {
      type: String,
      required: [true, 'Please add a country description'],
    },
    images: [String],
    bestTimeToVisit: String,
    travelTips: [String],
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    stats: {
      destinationCount: { type: Number, default: 0 },
      cityCount: { type: Number, default: 0 },
    },
    timezone: String,
    drivingSide: {
      type: String,
      enum: ['left', 'right'],
    },
    visaInfo: {
      type: String,
      default: '',
    },
    healthInfo: {
      type: String,
      default: '',
    },
    safetyInfo: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    funFact: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate cities
countrySchema.virtual('cities', {
  ref: 'City',
  localField: '_id',
  foreignField: 'country',
  options: { sort: { isPopular: -1, name: 1 } },
});

// Slugify name before save
countrySchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

countrySchema.index({ continent: 1, name: 1 });
countrySchema.index({ isPremium: 1 });
countrySchema.index({ isPopular: 1 });
countrySchema.index({ slug: 1 });

module.exports = mongoose.model('Country', countrySchema);
