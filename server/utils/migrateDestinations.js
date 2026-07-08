const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate-ai';

const allDestinations = [
  {
    name: 'Paris', country: 'France',
    description: 'The City of Light beckons with its romantic ambiance, world-class cuisine, and iconic landmarks that have inspired artists and dreamers for centuries.',
    bestTimeToVisit: 'June to August and September to October',
    estimatedBudget: { min: 1500, max: 5000, currency: 'USD' },
    attractions: [
      { name: 'Eiffel Tower', description: 'Iconic iron lattice tower', rating: 4.7, location: { lat: 48.8584, lng: 2.2945 } },
      { name: 'Louvre Museum', description: "World's largest art museum", rating: 4.8, location: { lat: 48.8606, lng: 2.3376 } },
      { name: 'Notre-Dame Cathedral', description: 'Medieval Catholic cathedral', rating: 4.7, location: { lat: 48.8530, lng: 2.3499 } },
    ],
    coordinates: { lat: 48.8566, lng: 2.3522 }, isPopular: true, currency: 'EUR',
    spokenLanguage: 'french', timezone: 'CET',
    travelTips: ['Learn basic French phrases', 'Use metro for transportation', 'Book museum tickets in advance'],
  },
  {
    name: 'Tokyo', country: 'Japan',
    description: "A mesmerizing blend of ultramodern and traditional, Tokyo offers endless discovery through its neon-lit streets, ancient temples, and culinary wonders.",
    bestTimeToVisit: 'March to May and September to November',
    estimatedBudget: { min: 2000, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Senso-ji Temple', description: 'Ancient Buddhist temple', rating: 4.6, location: { lat: 35.7148, lng: 139.7967 } },
      { name: 'Shibuya Crossing', description: 'Busiest pedestrian crossing', rating: 4.5, location: { lat: 35.6595, lng: 139.7004 } },
      { name: 'Tokyo Tower', description: 'Communications tower with observation decks', rating: 4.4, location: { lat: 35.6586, lng: 139.7454 } },
    ],
    coordinates: { lat: 35.6762, lng: 139.6503 }, isPopular: true, currency: 'JPY',
    spokenLanguage: 'japanese', timezone: 'JST',
    travelTips: ['Get a Suica card for trains', 'Try convenience store food', 'Learn basic Japanese etiquette'],
  },
  {
    name: 'Bali', country: 'Indonesia',
    description: 'A tropical paradise of terraced rice paddies, ancient temples, and vibrant culture, Bali is the ultimate destination for relaxation and adventure.',
    bestTimeToVisit: 'April to October',
    estimatedBudget: { min: 800, max: 3000, currency: 'USD' },
    attractions: [
      { name: 'Ubud Monkey Forest', description: 'Nature reserve and temple complex', rating: 4.5, location: { lat: -8.5181, lng: 115.2590 } },
      { name: 'Tanah Lot Temple', description: 'Sea temple on rocky outcrop', rating: 4.6, location: { lat: -8.6213, lng: 115.0868 } },
      { name: 'Tegallalang Rice Terraces', description: 'Beautiful rice paddies', rating: 4.5, location: { lat: -8.4318, lng: 115.2799 } },
    ],
    coordinates: { lat: -8.3405, lng: 115.0920 }, isPopular: true, currency: 'IDR',
    spokenLanguage: 'indonesian', timezone: 'WITA',
    travelTips: ['Rent a scooter for easy travel', 'Respect temple dress codes', 'Drink bottled water'],
  },
  {
    name: 'New York City', country: 'United States',
    description: 'The Big Apple offers an unparalleled urban experience with its iconic skyline, diverse neighborhoods, world-class museums, and endless entertainment.',
    bestTimeToVisit: 'April to June and September to November',
    estimatedBudget: { min: 2000, max: 8000, currency: 'USD' },
    attractions: [
      { name: 'Statue of Liberty', description: 'Iconic American symbol', rating: 4.7, location: { lat: 40.6892, lng: -74.0445 } },
      { name: 'Central Park', description: 'Urban park in Manhattan', rating: 4.8, location: { lat: 40.7829, lng: -73.9654 } },
      { name: 'Times Square', description: 'Commercial and entertainment hub', rating: 4.5, location: { lat: 40.7580, lng: -73.9855 } },
    ],
    coordinates: { lat: 40.7128, lng: -74.0060 }, isPopular: true, currency: 'USD',
    spokenLanguage: 'english', timezone: 'EST',
    travelTips: ['Use subway for transportation', 'Book Broadway shows in advance', 'Walk across Brooklyn Bridge'],
  },
  {
    name: 'Dubai', country: 'United Arab Emirates',
    description: "A city of superlatives, Dubai dazzles with its futuristic architecture, luxury shopping, desert adventures, and warm Arabian hospitality.",
    bestTimeToVisit: 'November to March',
    estimatedBudget: { min: 2500, max: 10000, currency: 'USD' },
    attractions: [
      { name: 'Burj Khalifa', description: "World's tallest building", rating: 4.8, location: { lat: 25.1972, lng: 55.2744 } },
      { name: 'Palm Jumeirah', description: 'Artificial archipelago', rating: 4.6, location: { lat: 25.1124, lng: 55.1390 } },
      { name: 'Dubai Mall', description: "One of the world's largest malls", rating: 4.7, location: { lat: 25.1986, lng: 55.2796 } },
    ],
    coordinates: { lat: 25.2048, lng: 55.2708 }, isPopular: true, currency: 'AED',
    spokenLanguage: 'arabic', timezone: 'GST',
    travelTips: ['Dress modestly in public', 'Avoid summer months', 'Use taxis or metro'],
  },
  {
    name: 'Rome', country: 'Italy',
    description: "The Eternal City captivates with its ancient ruins, Renaissance art, sublime cuisine, and a vibrant street life that has thrived for over two millennia.",
    bestTimeToVisit: 'April to June and September to October',
    estimatedBudget: { min: 1200, max: 4500, currency: 'USD' },
    attractions: [
      { name: 'Colosseum', description: 'Ancient Roman amphitheater', rating: 4.8, location: { lat: 41.8902, lng: 12.4922 } },
      { name: 'Vatican Museums', description: 'Papal art collection and museums', rating: 4.7, location: { lat: 41.9065, lng: 12.4536 } },
      { name: 'Trevi Fountain', description: 'Baroque fountain masterpiece', rating: 4.6, location: { lat: 41.9009, lng: 12.4833 } },
    ],
    coordinates: { lat: 41.9028, lng: 12.4964 }, isPopular: true, currency: 'EUR',
    spokenLanguage: 'italian', timezone: 'CET',
    travelTips: ['Book Colosseum tickets online', 'Visit Vatican early morning', 'Toss a coin in Trevi Fountain'],
  },
  {
    name: 'Bangkok', country: 'Thailand',
    description: "A sensory explosion of golden temples, floating markets, sizzling street food stalls, and a nightlife that never sleeps in Southeast Asia's most dynamic city.",
    bestTimeToVisit: 'November to February',
    estimatedBudget: { min: 500, max: 2000, currency: 'USD' },
    attractions: [
      { name: 'Grand Palace', description: 'Former royal residence with Wat Phra Kaew', rating: 4.6, location: { lat: 13.7500, lng: 100.4914 } },
      { name: 'Wat Arun', description: 'Temple of Dawn along the Chao Phraya', rating: 4.5, location: { lat: 13.7437, lng: 100.4888 } },
      { name: 'Chatuchak Market', description: 'One of the largest weekend markets', rating: 4.4, location: { lat: 13.7999, lng: 100.5502 } },
    ],
    coordinates: { lat: 13.7563, lng: 100.5018 }, isPopular: true, currency: 'THB',
    spokenLanguage: 'thai', timezone: 'ICT',
    travelTips: ['Use tuk-tuks for short trips', 'Try street food with confidence', 'Dress modestly at temples'],
  },
  {
    name: 'London', country: 'United Kingdom',
    description: "A global hub of history, culture, and innovation where royal pageantry meets cutting-edge art, world-class theatre, and diverse culinary scenes.",
    bestTimeToVisit: 'March to May and September to November',
    estimatedBudget: { min: 1800, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Big Ben', description: 'Iconic clock tower at Parliament', rating: 4.6, location: { lat: 51.5007, lng: -0.1246 } },
      { name: 'British Museum', description: 'World history museum with the Rosetta Stone', rating: 4.8, location: { lat: 51.5194, lng: -0.1270 } },
      { name: 'Tower Bridge', description: 'Victorian bascule bridge over Thames', rating: 4.7, location: { lat: 51.5055, lng: -0.0754 } },
    ],
    coordinates: { lat: 51.5074, lng: -0.1278 }, isPopular: true, currency: 'GBP',
    spokenLanguage: 'english', timezone: 'GMT',
    travelTips: ['Get an Oyster card for transport', 'Book museum entries free online', 'Watch the Changing of the Guard'],
  },
  {
    name: 'Sydney', country: 'Australia',
    description: 'A stunning harbour city where golden beaches, world-famous architecture, and a laid-back outdoor lifestyle meet a thriving arts and food scene.',
    bestTimeToVisit: 'October to April',
    estimatedBudget: { min: 2000, max: 7000, currency: 'USD' },
    attractions: [
      { name: 'Sydney Opera House', description: 'UNESCO-listed performing arts venue', rating: 4.8, location: { lat: -33.8568, lng: 151.2153 } },
      { name: 'Bondi Beach', description: 'Iconic beach with coastal walk', rating: 4.6, location: { lat: -33.8915, lng: 151.2767 } },
      { name: 'Sydney Harbour Bridge', description: 'Climbable steel arch bridge', rating: 4.7, location: { lat: -33.8523, lng: 151.2108 } },
    ],
    coordinates: { lat: -33.8688, lng: 151.2093 }, isPopular: true, currency: 'AUD',
    spokenLanguage: 'english', timezone: 'AEST',
    travelTips: ['Take the ferry to Manly', 'Apply sunscreen liberally', 'Pack layers for changeable weather'],
  },
  {
    name: 'Barcelona', country: 'Spain',
    description: "A Mediterranean gem where Gaudí's whimsical architecture, sun-drenched beaches, lively tapas bars, and a rich Catalan culture create an unforgettable escape.",
    bestTimeToVisit: 'May to June and September to October',
    estimatedBudget: { min: 1000, max: 4000, currency: 'USD' },
    attractions: [
      { name: 'Sagrada Familia', description: "Gaudí's unfinished basilica masterpiece", rating: 4.8, location: { lat: 41.4036, lng: 2.1744 } },
      { name: 'Park Güell', description: 'Whimsical public park by Gaudí', rating: 4.5, location: { lat: 41.4145, lng: 2.1527 } },
      { name: 'La Rambla', description: 'Iconic tree-lined pedestrian street', rating: 4.4, location: { lat: 41.3809, lng: 2.1733 } },
    ],
    coordinates: { lat: 41.3874, lng: 2.1686 }, isPopular: true, currency: 'EUR',
    spokenLanguage: 'spanish', timezone: 'CET',
    travelTips: ['Book Sagrada Familia weeks ahead', 'Watch for pickpockets on Las Ramblas', 'Try authentic paella and tapas'],
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // Drop old text index
  try {
    await db.collection('destinations').dropIndex('name_text_country_text_description_text');
    console.log('Dropped old text index');
  } catch (e) {
    console.log('No old text index to drop');
  }

  // Drop old language field from any existing docs and remove collection
  await db.collection('destinations').drop();
  console.log('Cleared destinations collection');

  // Create new text index with language_override set to a non-conflicting field
  await db.collection('destinations').createIndex(
    { name: 'text', country: 'text', description: 'text' },
    { language_override: 'none', default_language: 'none' }
  );
  console.log('Created new text index');

  // Recreate other indexes
  await db.collection('destinations').createIndex({ isPopular: 1 });
  await db.collection('destinations').createIndex({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

  // Insert all 10 destinations
  const Destination = require('../models/Destination');
  await Destination.insertMany(allDestinations);
  console.log(`Inserted ${allDestinations.length} destinations`);

  const count = await Destination.countDocuments();
  console.log(`Total destinations: ${count}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });

