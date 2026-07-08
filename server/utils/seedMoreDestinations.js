const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate-ai';

const extraDestinations = [
  {
    name: 'Rome',
    country: 'Italy',
    description: 'The Eternal City captivates with its ancient ruins, Renaissance art, sublime cuisine, and a vibrant street life that has thrived for over two millennia.',
    bestTimeToVisit: 'April to June and September to October',
    estimatedBudget: { min: 1200, max: 4500, currency: 'USD' },
    attractions: [
      { name: 'Colosseum', description: 'Ancient Roman amphitheater', rating: 4.8, location: { lat: 41.8902, lng: 12.4922 } },
      { name: 'Vatican Museums', description: 'Papal art collection and museums', rating: 4.7, location: { lat: 41.9065, lng: 12.4536 } },
      { name: 'Trevi Fountain', description: 'Baroque fountain masterpiece', rating: 4.6, location: { lat: 41.9009, lng: 12.4833 } },
    ],
    coordinates: { lat: 41.9028, lng: 12.4964 },
    isPopular: true,
    currency: 'EUR',
    language: 'Italian',
    timezone: 'CET',
    travelTips: ['Book Colosseum tickets online', 'Visit Vatican early morning', ' toss a coin in Trevi Fountain'],
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    description: 'A sensory explosion of golden temples, floating markets, sizzling street food stalls, and a nightlife that never sleeps in Southeast Asia\'s most dynamic city.',
    bestTimeToVisit: 'November to February',
    estimatedBudget: { min: 500, max: 2000, currency: 'USD' },
    attractions: [
      { name: 'Grand Palace', description: 'Former royal residence with Wat Phra Kaew', rating: 4.6, location: { lat: 13.7500, lng: 100.4914 } },
      { name: 'Wat Arun', description: 'Temple of Dawn along the Chao Phraya', rating: 4.5, location: { lat: 13.7437, lng: 100.4888 } },
      { name: 'Chatuchak Market', description: 'One of the largest weekend markets', rating: 4.4, location: { lat: 13.7999, lng: 100.5502 } },
    ],
    coordinates: { lat: 13.7563, lng: 100.5018 },
    isPopular: true,
    currency: 'THB',
    timezone: 'ICT',
    travelTips: ['Use tuk-tuks for short trips', 'Try street food with confidence', 'Dress modestly at temples'],
  },
  {
    name: 'London',
    country: 'United Kingdom',
    description: 'A global hub of history, culture, and innovation where royal pageantry meets cutting-edge art, world-class theatre, and diverse culinary scenes.',
    bestTimeToVisit: 'March to May and September to November',
    estimatedBudget: { min: 1800, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Big Ben', description: 'Iconic clock tower at Parliament', rating: 4.6, location: { lat: 51.5007, lng: -0.1246 } },
      { name: 'British Museum', description: 'World history museum with the Rosetta Stone', rating: 4.8, location: { lat: 51.5194, lng: -0.1270 } },
      { name: 'Tower Bridge', description: 'Victorian bascule bridge over Thames', rating: 4.7, location: { lat: 51.5055, lng: -0.0754 } },
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 },
    isPopular: true,
    currency: 'GBP',
    language: 'English',
    timezone: 'GMT',
    travelTips: ['Get an Oyster card for transport', 'Book museum entries free online', 'Watch the Changing of the Guard'],
  },
  {
    name: 'Sydney',
    country: 'Australia',
    description: 'A stunning harbour city where golden beaches, world-famous architecture, and a laid-back outdoor lifestyle meet a thriving arts and food scene.',
    bestTimeToVisit: 'October to April',
    estimatedBudget: { min: 2000, max: 7000, currency: 'USD' },
    attractions: [
      { name: 'Sydney Opera House', description: 'UNESCO-listed performing arts venue', rating: 4.8, location: { lat: -33.8568, lng: 151.2153 } },
      { name: 'Bondi Beach', description: 'Iconic beach with coastal walk', rating: 4.6, location: { lat: -33.8915, lng: 151.2767 } },
      { name: 'Sydney Harbour Bridge', description: 'Climbable steel arch bridge', rating: 4.7, location: { lat: -33.8523, lng: 151.2108 } },
    ],
    coordinates: { lat: -33.8688, lng: 151.2093 },
    isPopular: true,
    currency: 'AUD',
    language: 'English',
    timezone: 'AEST',
    travelTips: ['Take the ferry to Manly', 'Apply sunscreen liberally', 'Pack layers for changeable weather'],
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    description: 'A Mediterranean gem where Gaudí\'s whimsical architecture, sun-drenched beaches, lively tapas bars, and a rich Catalan culture create an unforgettable escape.',
    bestTimeToVisit: 'May to June and September to October',
    estimatedBudget: { min: 1000, max: 4000, currency: 'USD' },
    attractions: [
      { name: 'Sagrada Familia', description: 'Gaudí\'s unfinished basilica masterpiece', rating: 4.8, location: { lat: 41.4036, lng: 2.1744 } },
      { name: 'Park Güell', description: 'Whimsical public park by Gaudí', rating: 4.5, location: { lat: 41.4145, lng: 2.1527 } },
      { name: 'La Rambla', description: 'Iconic tree-lined pedestrian street', rating: 4.4, location: { lat: 41.3809, lng: 2.1733 } },
    ],
    coordinates: { lat: 41.3874, lng: 2.1686 },
    isPopular: true,
    currency: 'EUR',
    timezone: 'CET',
    travelTips: ['Book Sagrada Familia weeks ahead', 'Watch for pickpockets on Las Ramblas', 'Try authentic paella and tapas'],
  },
];

const seedExtra = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate-ai');
    console.log('MongoDB connected');

    for (const dest of extraDestinations) {
      const existing = await Destination.findOne({ name: dest.name });
      if (!existing) {
        await Destination.create(dest);
        console.log(`Added: ${dest.name}`);
      } else {
        console.log(`Skipped (already exists): ${dest.name}`);
      }
    }

    const total = await Destination.countDocuments();
    console.log(`Total destinations now: ${total}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedExtra();
