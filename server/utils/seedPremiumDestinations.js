const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate-ai';

const premiumDestinations = [
  {
    name: 'Santorini',
    country: 'Greece',
    description: 'A breathtaking Cycladic island of white-washed buildings, blue-domed churches, dramatic caldera views, and unforgettable sunsets over the Aegean Sea.',
    bestTimeToVisit: 'June to September',
    estimatedBudget: { min: 2000, max: 7000, currency: 'USD' },
    attractions: [
      { name: 'Oia Village', description: 'Iconic sunset viewpoint with blue domes', rating: 4.8, location: { lat: 36.4618, lng: 25.3753 } },
      { name: 'Red Beach', description: 'Stunning red volcanic sand beach', rating: 4.5, location: { lat: 36.3478, lng: 25.4268 } },
      { name: 'Ancient Thera', description: 'Archaeological site atop Mesa Vouno', rating: 4.4, location: { lat: 36.3619, lng: 25.4776 } },
    ],
    coordinates: { lat: 36.3932, lng: 25.4615 },
    isPopular: false,
    isPremium: true,
    currency: 'EUR',
    language: 'Greek',
    timezone: 'EET',
    travelTips: ['Book accommodation months in advance', 'Rent an ATV for island exploration', 'Take a sunset catamaran cruise'],
  },
  {
    name: 'Machu Picchu',
    country: 'Peru',
    description: 'The Lost City of the Incas, perched high in the Andes, offers a mystical journey through ancient stone terraces, temple ruins, and cloud-forest peaks.',
    bestTimeToVisit: 'April to October',
    estimatedBudget: { min: 1500, max: 5000, currency: 'USD' },
    attractions: [
      { name: 'Sun Gate', description: 'Inca entry point with sunrise views', rating: 4.9, location: { lat: -13.1703, lng: -72.5410 } },
      { name: 'Temple of the Sun', description: 'Semicircular Inca temple', rating: 4.7, location: { lat: -13.1631, lng: -72.5450 } },
      { name: 'Huayna Picchu', description: 'Iconic peak behind Machu Picchu', rating: 4.8, location: { lat: -13.1565, lng: -72.5460 } },
    ],
    coordinates: { lat: -13.1631, lng: -72.5450 },
    isPopular: false,
    isPremium: true,
    currency: 'PEN',
    language: 'Spanish',
    timezone: 'PET',
    travelTips: ['Book tickets months in advance', 'Acclimatize in Cusco first', 'Hire a guide for historical context'],
  },
  {
    name: 'Maldives',
    country: 'Maldives',
    description: 'A tropical paradise of crystal-clear waters, overwater bungalows, vibrant coral reefs, and pristine white-sand beaches scattered across the Indian Ocean.',
    bestTimeToVisit: 'November to April',
    estimatedBudget: { min: 3000, max: 12000, currency: 'USD' },
    attractions: [
      { name: 'Male Atoll', description: 'Capital region with luxury resorts', rating: 4.7, location: { lat: 4.1755, lng: 73.5093 } },
      { name: 'Biyadhoo Beach', description: 'Secluded white sand paradise', rating: 4.6, location: { lat: 4.0296, lng: 73.4802 } },
      { name: 'Maafushi Island', description: 'Local island with beautiful beaches', rating: 4.4, location: { lat: 3.9413, lng: 73.4858 } },
    ],
    coordinates: { lat: 3.2028, lng: 73.2207 },
    isPopular: false,
    isPremium: true,
    currency: 'MVR',
    language: 'Dhivehi',
    timezone: 'MVT',
    travelTips: ['Choose resorts with half-board packages', 'Pack reef-safe sunscreen', 'Respect local customs on inhabited islands'],
  },
  {
    name: 'Swiss Alps',
    country: 'Switzerland',
    description: 'Majestic snow-capped peaks, pristine alpine lakes, charming mountain villages, and world-class skiing make the Swiss Alps a year-round wonderland.',
    bestTimeToVisit: 'December to March (ski) / June to September (hike)',
    estimatedBudget: { min: 3000, max: 10000, currency: 'USD' },
    attractions: [
      { name: 'Jungfraujoch', description: 'Top of Europe railway station', rating: 4.8, location: { lat: 46.5474, lng: 7.9844 } },
      { name: 'Lake Geneva', description: 'Crescent-shaped alpine lake', rating: 4.7, location: { lat: 46.4536, lng: 6.5823 } },
      { name: 'Zermatt', description: 'Car-free village with Matterhorn views', rating: 4.8, location: { lat: 46.0207, lng: 7.7491 } },
    ],
    coordinates: { lat: 46.8182, lng: 8.2275 },
    isPopular: false,
    isPremium: true,
    currency: 'CHF',
    language: 'German',
    timezone: 'CET',
    travelTips: ['Get a Swiss Travel Pass for unlimited trains', 'Pack layers for changing weather', 'Try fondue in a mountain hut'],
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    description: 'Japan\'s cultural soul, home to thousands of serene Zen temples, traditional tea houses, enchanting bamboo groves, and the timeless art of geisha culture.',
    bestTimeToVisit: 'March to May and October to November',
    estimatedBudget: { min: 2000, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Fushimi Inari Shrine', description: 'Thousands of vermilion torii gates', rating: 4.7, location: { lat: 34.9671, lng: 135.7726 } },
      { name: 'Arashiyama Bamboo Grove', description: 'Towering bamboo forest path', rating: 4.6, location: { lat: 35.0170, lng: 135.6713 } },
      { name: 'Kinkaku-ji', description: 'Golden Pavilion temple', rating: 4.7, location: { lat: 35.0394, lng: 135.7292 } },
    ],
    coordinates: { lat: 35.0116, lng: 135.7681 },
    isPopular: false,
    isPremium: true,
    currency: 'JPY',
    language: 'Japanese',
    timezone: 'JST',
    travelTips: ['Visit temples early to avoid crowds', 'Take a traditional tea ceremony', 'Walk the Philosopher\'s Path in spring'],
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    description: 'Where the Atlantic meets the Indian Ocean, Cape Town dazzles with its flat-topped Table Mountain, stunning coastline, vibrant food scene, and rich multicultural history.',
    bestTimeToVisit: 'November to March',
    estimatedBudget: { min: 1200, max: 4500, currency: 'USD' },
    attractions: [
      { name: 'Table Mountain', description: 'Iconic flat-topped mountain landmark', rating: 4.8, location: { lat: -33.9628, lng: 18.4098 } },
      { name: 'Boulders Beach', description: 'Penguin colony beach', rating: 4.6, location: { lat: -34.1975, lng: 18.4512 } },
      { name: 'V&A Waterfront', description: 'Harbor-side shopping and dining hub', rating: 4.5, location: { lat: -33.9036, lng: 18.4219 } },
    ],
    coordinates: { lat: -33.9249, lng: 18.4241 },
    isPopular: false,
    isPremium: true,
    currency: 'ZAR',
    language: 'Afrikaans',
    timezone: 'SAST',
    travelTips: ['Take the cable car up Table Mountain', 'Drive Chapman\'s Peak for scenery', 'Sample local wines in nearby Stellenbosch'],
  },
  {
    name: 'Amalfi Coast',
    country: 'Italy',
    description: 'A dramatic stretch of coastline dotted with pastel-colored villages clinging to cliffs, lemon groves, turquoise waters, and some of Italy\'s finest cuisine.',
    bestTimeToVisit: 'May to September',
    estimatedBudget: { min: 2000, max: 7000, currency: 'USD' },
    attractions: [
      { name: 'Positano', description: 'Vertical cliffside village with boutiques', rating: 4.7, location: { lat: 40.6283, lng: 14.4843 } },
      { name: 'Path of the Gods', description: 'Scenic cliffside hiking trail', rating: 4.8, location: { lat: 40.6375, lng: 14.4909 } },
      { name: 'Ravello', description: 'Hilltop town with stunning gardens', rating: 4.6, location: { lat: 40.6492, lng: 14.6112 } },
    ],
    coordinates: { lat: 40.6333, lng: 14.6000 },
    isPopular: false,
    isPremium: true,
    currency: 'EUR',
    language: 'Italian',
    timezone: 'CET',
    travelTips: ['Avoid driving — take ferries between towns', 'Visit in shoulder season for fewer crowds', 'Try fresh limoncello and seafood'],
  },
  {
    name: 'Banff National Park',
    country: 'Canada',
    description: 'Canada\'s first national park is a wilderness masterpiece of turquoise glacial lakes, rugged mountain peaks, dense pine forests, and abundant wildlife.',
    bestTimeToVisit: 'June to August and December to March',
    estimatedBudget: { min: 1800, max: 6000, currency: 'USD' },
    attractions: [
      { name: 'Lake Louise', description: 'Iconic turquoise glacier-fed lake', rating: 4.9, location: { lat: 51.4122, lng: -116.2283 } },
      { name: 'Moraine Lake', description: 'Stunning valley lake with canoeing', rating: 4.9, location: { lat: 51.3268, lng: -116.1824 } },
      { name: 'Banff Gondola', description: 'Cable car to Sulphur Mountain summit', rating: 4.6, location: { lat: 51.1480, lng: -115.5736 } },
    ],
    coordinates: { lat: 51.4968, lng: -115.9281 },
    isPopular: false,
    isPremium: true,
    currency: 'CAD',
    language: 'English',
    timezone: 'MST',
    travelTips: ['Arrive at Lake Louise before 7 AM', 'Carry bear spray on hikes', 'Book accommodation well in advance'],
  },
  {
    name: 'Queenstown',
    country: 'New Zealand',
    description: 'The adventure capital of the world, set on the shores of Lake Wakatipu with dramatic mountain backdrops — home to bungee jumping, skiing, and breathtaking Fiordland scenery.',
    bestTimeToVisit: 'December to February (summer) / June to August (ski)',
    estimatedBudget: { min: 2200, max: 7500, currency: 'USD' },
    attractions: [
      { name: 'Milford Sound', description: 'Majestic fiord with waterfalls and dolphins', rating: 4.9, location: { lat: -44.6694, lng: 167.9264 } },
      { name: 'Skyline Gondola', description: 'Gondola ride with lake and mountain views', rating: 4.6, location: { lat: -45.0210, lng: 168.6516 } },
      { name: 'Shotover River', description: 'Thrilling jet boat rides through canyons', rating: 4.7, location: { lat: -44.9867, lng: 168.7379 } },
    ],
    coordinates: { lat: -45.0312, lng: 168.6626 },
    isPopular: false,
    isPremium: true,
    currency: 'NZD',
    language: 'English',
    timezone: 'NZST',
    travelTips: ['Try bungee jumping at the original Kawarau Bridge', 'Book Milford Sound cruise in advance', 'Rent a car to explore the region freely'],
  },
  {
    name: 'Reykjavik & Golden Circle',
    country: 'Iceland',
    description: 'A land of fire and ice where geothermal hot springs, thundering waterfalls, glacial lagoons, and the magical Northern Lights create an otherworldly adventure.',
    bestTimeToVisit: 'June to August (summer) / September to March (Northern Lights)',
    estimatedBudget: { min: 2500, max: 8000, currency: 'USD' },
    attractions: [
      { name: 'Blue Lagoon', description: 'Iconic geothermal spa in lava fields', rating: 4.6, location: { lat: 63.8799, lng: -22.4494 } },
      { name: 'Gullfoss Waterfall', description: 'Majestic two-tiered waterfall canyon', rating: 4.8, location: { lat: 64.3261, lng: -20.1197 } },
      { name: 'Jökulsárlón Glacier Lagoon', description: 'Glacial lagoon with floating icebergs', rating: 4.9, location: { lat: 64.0481, lng: -16.1806 } },
    ],
    coordinates: { lat: 64.1466, lng: -21.9426 },
    isPopular: false,
    isPremium: true,
    currency: 'ISK',
    language: 'Icelandic',
    timezone: 'GMT',
    travelTips: ['Rent a 4x4 for the Ring Road', 'Pack thermal layers and rain gear', 'Book Blue Lagoon tickets far ahead'],
  },
];

const seedPremiumDestinations = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    let added = 0;
    for (const dest of premiumDestinations) {
      const existing = await Destination.findOne({ name: dest.name, country: dest.country });
      if (!existing) {
        await Destination.create(dest);
        console.log(`Added premium destination: ${dest.name}, ${dest.country}`);
        added++;
      } else {
        console.log(`Skipped (already exists): ${dest.name}, ${dest.country}`);
      }
    }

    const total = await Destination.countDocuments();
    const premiumCount = await Destination.countDocuments({ isPremium: true });
    console.log(`\n✅ Added ${added} new premium destinations`);
    console.log(`📊 Total destinations: ${total} (${premiumCount} premium)`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding premium destinations:', error.message);
    process.exit(1);
  }
};

seedPremiumDestinations();
