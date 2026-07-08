const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Destination = require('../models/Destination');

dotenv.config({ path: '../.env' });

const popularDestinations = [
  {
    name: 'Paris',
    country: 'France',
    description: 'The City of Light beckons with its romantic ambiance, world-class cuisine, and iconic landmarks that have inspired artists and dreamers for centuries.',
    bestTimeToVisit: 'June to August and September to October',
    estimatedBudget: { min: 1500, max: 5000, currency: 'USD' },
    attractions: [
      { name: 'Eiffel Tower', description: 'Iconic iron lattice tower', rating: 4.7, location: { lat: 48.8584, lng: 2.2945 } },
      { name: 'Louvre Museum', description: 'World\'s largest art museum', rating: 4.8, location: { lat: 48.8606, lng: 2.3376 } },
      { name: 'Notre-Dame Cathedral', description: 'Medieval Catholic cathedral', rating: 4.7, location: { lat: 48.8530, lng: 2.3499 } },
    ],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    isPopular: true,
    currency: 'EUR',
    language: 'French',
    timezone: 'CET',
    travelTips: ['Learn basic French phrases', 'Use metro for transportation', 'Book museum tickets in advance'],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    description: 'A mesmerizing blend of ultramodern and traditional, Tokyo offers endless discovery through its neon-lit streets, ancient temples, and culinary wonders.',
    bestTimeToVisit: 'March to May and September to November',
    estimatedBudget: { min: 2000, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Senso-ji Temple', description: 'Ancient Buddhist temple', rating: 4.6, location: { lat: 35.7148, lng: 139.7967 } },
      { name: 'Shibuya Crossing', description: 'Busiest pedestrian crossing', rating: 4.5, location: { lat: 35.6595, lng: 139.7004 } },
      { name: 'Tokyo Tower', description: 'Communications tower with observation decks', rating: 4.4, location: { lat: 35.6586, lng: 139.7454 } },
    ],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    isPopular: true,
    currency: 'JPY',
    language: 'Japanese',
    timezone: 'JST',
    travelTips: ['Get a Suica card for trains', 'Try convenience store food', 'Learn basic Japanese etiquette'],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    description: 'A tropical paradise of terraced rice paddies, ancient temples, and vibrant culture, Bali is the ultimate destination for relaxation and adventure.',
    bestTimeToVisit: 'April to October',
    estimatedBudget: { min: 800, max: 3000, currency: 'USD' },
    attractions: [
      { name: 'Ubud Monkey Forest', description: 'Nature reserve and temple complex', rating: 4.5, location: { lat: -8.5181, lng: 115.2590 } },
      { name: 'Tanah Lot Temple', description: 'Sea temple on rocky outcrop', rating: 4.6, location: { lat: -8.6213, lng: 115.0868 } },
      { name: 'Tegallalang Rice Terraces', description: 'Beautiful rice paddies', rating: 4.5, location: { lat: -8.4318, lng: 115.2799 } },
    ],
    coordinates: { lat: -8.3405, lng: 115.0920 },
    isPopular: true,
    currency: 'IDR',
    language: 'Indonesian',
    timezone: 'WITA',
    travelTips: ['Rent a scooter for easy travel', 'Respect temple dress codes', 'Drink bottled water'],
  },
  {
    name: 'New York City',
    country: 'United States',
    description: 'The Big Apple offers an unparalleled urban experience with its iconic skyline, diverse neighborhoods, world-class museums, and endless entertainment.',
    bestTimeToVisit: 'April to June and September to November',
    estimatedBudget: { min: 2000, max: 8000, currency: 'USD' },
    attractions: [
      { name: 'Statue of Liberty', description: 'Iconic American symbol', rating: 4.7, location: { lat: 40.6892, lng: -74.0445 } },
      { name: 'Central Park', description: 'Urban park in Manhattan', rating: 4.8, location: { lat: 40.7829, lng: -73.9654 } },
      { name: 'Times Square', description: 'Commercial and entertainment hub', rating: 4.5, location: { lat: 40.7580, lng: -73.9855 } },
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    isPopular: true,
    currency: 'USD',
    language: 'English',
    timezone: 'EST',
    travelTips: ['Use subway for transportation', 'Book Broadway shows in advance', 'Walk across Brooklyn Bridge'],
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    description: 'A city of superlatives, Dubai dazzles with its futuristic architecture, luxury shopping, desert adventures, and warm Arabian hospitality.',
    bestTimeToVisit: 'November to March',
    estimatedBudget: { min: 2500, max: 10000, currency: 'USD' },
    attractions: [
      { name: 'Burj Khalifa', description: 'World\'s tallest building', rating: 4.8, location: { lat: 25.1972, lng: 55.2744 } },
      { name: 'Palm Jumeirah', description: 'Artificial archipelago', rating: 4.6, location: { lat: 25.1124, lng: 55.1390 } },
      { name: 'Dubai Mall', description: 'One of the world\'s largest malls', rating: 4.7, location: { lat: 25.1986, lng: 55.2796 } },
    ],
    coordinates: { lat: 25.2048, lng: 55.2708 },
    isPopular: true,
    currency: 'AED',
    language: 'Arabic',
    timezone: 'GST',
    travelTips: ['Dress modestly in public', 'Avoid summer months', 'Use taxis or metro'],
  },
];

const seedDestinations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected'.cyan);

    await Destination.deleteMany();
    console.log('Destinations cleared'.yellow);

    await Destination.insertMany(popularDestinations);
    console.log(`${popularDestinations.length} destinations seeded`.green);

    process.exit(0);
  } catch (error) {
    console.error(error.message.red);
    process.exit(1);
  }
};

seedDestinations();
