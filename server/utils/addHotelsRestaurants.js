const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate-ai';

const extraData = {
  'Paris': {
    hotels: [
      { name: 'Hôtel Plaza Athénée', type: 'luxury', pricePerNight: 850, rating: 4.8, amenities: ['Spa', 'Michelin Restaurant', 'Eiffel Tower View'] },
      { name: 'Hôtel Le Marais', type: 'mid-range', pricePerNight: 280, rating: 4.4, amenities: ['Free WiFi', 'Breakfast', 'Bike Rental'] },
      { name: 'Ibis Paris Centre', type: 'budget', pricePerNight: 110, rating: 4.0, amenities: ['Free WiFi', '24hr Reception'] },
    ],
    restaurants: [
      { name: 'Le Cinq', cuisine: 'French', priceRange: '$$$$', rating: 4.9 },
      { name: 'L\'Ambroisie', cuisine: 'French', priceRange: '$$$$', rating: 4.8 },
      { name: 'Breizh Café', cuisine: 'Creperie', priceRange: '$$', rating: 4.5 },
    ],
  },
  'Tokyo': {
    hotels: [
      { name: 'Aman Tokyo', type: 'luxury', pricePerNight: 950, rating: 4.9, amenities: ['Spa', 'Sky Pool', 'Michelin Dining'] },
      { name: 'Hotel Gracery Shinjuku', type: 'mid-range', pricePerNight: 200, rating: 4.3, amenities: ['Free WiFi', 'Restaurant', 'Godzilla View'] },
      { name: 'Capsule Inn Akihabara', type: 'budget', pricePerNight: 45, rating: 3.9, amenities: ['Free WiFi', 'Onsen', 'Lounge'] },
    ],
    restaurants: [
      { name: 'Sukiyabashi Jiro', cuisine: 'Sushi', priceRange: '$$$$', rating: 4.9 },
      { name: 'Ichiran Ramen', cuisine: 'Ramen', priceRange: '$$', rating: 4.6 },
      { name: 'Gonpachi Nishiazabu', cuisine: 'Japanese', priceRange: '$$$', rating: 4.4 },
    ],
  },
  'Bali': {
    hotels: [
      { name: 'Four Seasons Bali at Sayan', type: 'luxury', pricePerNight: 600, rating: 4.8, amenities: ['Spa', 'Infinity Pool', 'Yoga'] },
      { name: 'Padma Resort Ubud', type: 'mid-range', pricePerNight: 180, rating: 4.5, amenities: ['Pool', 'Restaurant', 'Free WiFi'] },
      { name: 'Kuta Budget Hostel', type: 'budget', pricePerNight: 25, rating: 3.8, amenities: ['Free WiFi', 'Breakfast', 'Lockers'] },
    ],
    restaurants: [
      { name: 'Locavore', cuisine: 'Indonesian Fusion', priceRange: '$$$', rating: 4.8 },
      { name: 'Naughty Nuri\'s Ubud', cuisine: 'BBQ', priceRange: '$$', rating: 4.5 },
      { name: 'Warung Babi Guling', cuisine: 'Balinese', priceRange: '$', rating: 4.6 },
    ],
  },
  'New York City': {
    hotels: [
      { name: 'The Plaza Hotel', type: 'luxury', pricePerNight: 750, rating: 4.7, amenities: ['Spa', 'Concierge', 'Central Park View'] },
      { name: 'Moxy NYC Chelsea', type: 'mid-range', pricePerNight: 220, rating: 4.2, amenities: ['Free WiFi', 'Bar', 'Rooftop'] },
      { name: 'HI NYC Hostel', type: 'budget', pricePerNight: 55, rating: 3.9, amenities: ['Free WiFi', 'Breakfast', 'Lockers'] },
    ],
    restaurants: [
      { name: 'Eleven Madison Park', cuisine: 'Modern American', priceRange: '$$$$', rating: 4.9 },
      { name: 'Katz\'s Delicatessen', cuisine: 'Deli', priceRange: '$$', rating: 4.6 },
      { name: 'Joe\'s Pizza', cuisine: 'Pizza', priceRange: '$', rating: 4.5 },
    ],
  },
  'Dubai': {
    hotels: [
      { name: 'Burj Al Arab', type: 'luxury', pricePerNight: 1500, rating: 4.9, amenities: ['Private Beach', 'Helipad', 'Underwater Restaurant'] },
      { name: 'Rove Downtown', type: 'mid-range', pricePerNight: 150, rating: 4.3, amenities: ['Pool', 'Free WiFi', 'Gym'] },
      { name: 'Dubai Youth Hostel', type: 'budget', pricePerNight: 35, rating: 3.7, amenities: ['Free WiFi', 'Breakfast'] },
    ],
    restaurants: [
      { name: 'Pierchic', cuisine: 'Seafood', priceRange: '$$$$', rating: 4.8 },
      { name: 'Al Mallah', cuisine: 'Lebanese', priceRange: '$', rating: 4.5 },
      { name: 'Zuma Dubai', cuisine: 'Japanese', priceRange: '$$$', rating: 4.7 },
    ],
  },
  'Rome': {
    hotels: [
      { name: 'Hotel Eden', type: 'luxury', pricePerNight: 600, rating: 4.7, amenities: ['Spa', 'Rooftop Restaurant', 'Concierge'] },
      { name: 'Hotel Colosseum', type: 'mid-range', pricePerNight: 160, rating: 4.3, amenities: ['Free WiFi', 'Breakfast', 'Terrace'] },
      { name: 'The Yellow Hostel', type: 'budget', pricePerNight: 30, rating: 4.0, amenities: ['Bar', 'Free WiFi', 'Events'] },
    ],
    restaurants: [
      { name: 'La Pergola', cuisine: 'Italian', priceRange: '$$$$', rating: 4.9 },
      { name: 'Da Enrico al 29', cuisine: 'Roman', priceRange: '$$', rating: 4.5 },
      { name: 'Pizzeria Da Baffetto', cuisine: 'Pizza', priceRange: '$', rating: 4.6 },
    ],
  },
  'Bangkok': {
    hotels: [
      { name: 'Mandarin Oriental Bangkok', type: 'luxury', pricePerNight: 400, rating: 4.8, amenities: ['Spa', 'River View', 'Michelin Dining'] },
      { name: 'Siam@Siam Design Hotel', type: 'mid-range', pricePerNight: 120, rating: 4.4, amenities: ['Pool', 'Free WiFi', 'Rooftop Bar'] },
      { name: 'Khao San Social Hostel', type: 'budget', pricePerNight: 15, rating: 3.7, amenities: ['Free WiFi', 'Breakfast', 'Bar'] },
    ],
    restaurants: [
      { name: 'Gaggan', cuisine: 'Progressive Indian', priceRange: '$$$$', rating: 4.9 },
      { name: 'Pad Thai Thip Samai', cuisine: 'Thai', priceRange: '$', rating: 4.6 },
      { name: 'Jay Fai', cuisine: 'Street Food', priceRange: '$$', rating: 4.7 },
    ],
  },
  'London': {
    hotels: [
      { name: 'The Ritz London', type: 'luxury', pricePerNight: 550, rating: 4.8, amenities: ['Spa', 'Michelin Restaurant', 'Afternoon Tea'] },
      { name: 'CitizenM Tower of London', type: 'mid-range', pricePerNight: 180, rating: 4.3, amenities: ['Free WiFi', 'Bar', 'City View'] },
      { name: 'YHA London Central', type: 'budget', pricePerNight: 35, rating: 3.9, amenities: ['Free WiFi', 'Breakfast', 'Common Room'] },
    ],
    restaurants: [
      { name: 'The Fat Duck', cuisine: 'Modern British', priceRange: '$$$$', rating: 4.8 },
      { name: 'Dishoom Covent Garden', cuisine: 'Indian', priceRange: '$$', rating: 4.6 },
      { name: 'Borough Market', cuisine: 'Various', priceRange: '$$', rating: 4.7 },
    ],
  },
  'Sydney': {
    hotels: [
      { name: 'Park Hyatt Sydney', type: 'luxury', pricePerNight: 700, rating: 4.9, amenities: ['Spa', 'Opera House View', 'Pool'] },
      { name: 'Mantra on Kent', type: 'mid-range', pricePerNight: 160, rating: 4.2, amenities: ['Free WiFi', 'Pool', 'Gym'] },
      { name: 'Sydney Central YHA', type: 'budget', pricePerNight: 40, rating: 4.0, amenities: ['Free WiFi', 'Rooftop', 'Kitchen'] },
    ],
    restaurants: [
      { name: 'Quay', cuisine: 'Modern Australian', priceRange: '$$$$', rating: 4.8 },
      { name: 'The Grounds of Alexandria', cuisine: 'Cafe', priceRange: '$$', rating: 4.5 },
      { name: 'Harry\'s De Wheels', cuisine: 'Pies', priceRange: '$', rating: 4.4 },
    ],
  },
  'Barcelona': {
    hotels: [
      { name: 'Majestic Hotel & Spa', type: 'luxury', pricePerNight: 450, rating: 4.7, amenities: ['Spa', 'Pool', 'Rooftop Terrace'] },
      { name: 'Hotel Catalonia Born', type: 'mid-range', pricePerNight: 140, rating: 4.3, amenities: ['Free WiFi', 'Pool', 'Breakfast'] },
      { name: '¡Barcelona! Hostel', type: 'budget', pricePerNight: 28, rating: 3.8, amenities: ['Free WiFi', 'Bar', 'Common Room'] },
    ],
    restaurants: [
      { name: 'Lasarte', cuisine: 'Spanish', priceRange: '$$$$', rating: 4.9 },
      { name: 'La Boqueria Market', cuisine: 'Market Food', priceRange: '$$', rating: 4.6 },
      { name: 'El Nacional', cuisine: 'Catalan', priceRange: '$$$', rating: 4.5 },
    ],
  },
};

async function run() {
  await mongoose.connect(MONGO_URI);
  for (const [name, data] of Object.entries(extraData)) {
    const dest = await Destination.findOne({ name });
    if (dest) {
      await Destination.findByIdAndUpdate(dest._id, {
        $set: { hotels: data.hotels, restaurants: data.restaurants },
      });
      console.log(`Updated: ${name}`);
    }
  }
  console.log('Done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
