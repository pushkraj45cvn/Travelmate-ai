/**
 * AI Travel Assistant Service
 * 
 * Provides intelligent travel planning responses.
 * If OPENAI_API_KEY is set, uses OpenAI API for dynamic responses.
 * Otherwise uses a comprehensive rule-based system.
 */

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
const HAS_OPENAI = API_KEY && API_KEY !== 'your-openai-api-key';

/**
 * Generate a system prompt based on user context
 */
function buildSystemPrompt(context = {}) {
  const parts = [
    'You are TravelMate AI, an expert travel planning assistant.',
    'You help users plan trips, suggest destinations, packing lists, itineraries, budgets, and travel tips.',
    'Be friendly, concise, and practical. Provide specific actionable advice.',
    'If asked about things outside travel, politely redirect to travel topics.',
  ];

  if (context.destination) {
    parts.push(`The user is planning a trip to ${context.destination}${context.country ? `, ${context.country}` : ''}.`);
  }
  if (context.travelType) {
    parts.push(`Their travel type is: ${context.travelType}.`);
  }
  if (context.duration) {
    parts.push(`Trip duration: ${context.duration} days.`);
  }
  if (context.budget) {
    parts.push(`Estimated budget: $${context.budget}.`);
  }

  return parts.join(' ');
}

/**
 * Get AI response using OpenAI API (via native https)
 */
async function getOpenAIResponse(messages, context) {
  if (!HAS_OPENAI) return getRuleBasedResponse(messages, context);

  try {
    const https = require('https');
    const systemPrompt = buildSystemPrompt(context);
    const body = JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = await new Promise((resolve, reject) => {
      const req = https.request(
        API_URL,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error('Invalid JSON response'));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    return response.choices?.[0]?.message?.content?.trim() || getRuleBasedResponse(messages, context);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return getRuleBasedResponse(messages, context);
  }
}

/**
 * Get response using rule-based system (no API key required)
 */
function getRuleBasedResponse(messages, context = {}) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Destination info
  if (lastMsg.includes('tell me about') || lastMsg.includes('what to do in') || lastMsg.includes('things to do in')) {
    return getDestinationAdvice(lastMsg);
  }

  // Packing
  if (lastMsg.includes('pack') || lastMsg.includes('packing') || lastMsg.includes('what to bring') || lastMsg.includes('luggage')) {
    return getPackingAdvice(lastMsg, context);
  }

  // Budget
  if (lastMsg.includes('budget') || lastMsg.includes('cost') || lastMsg.includes('expensive') || lastMsg.includes('cheap') || lastMsg.includes('money') || lastMsg.includes('spend')) {
    return getBudgetAdvice(lastMsg, context);
  }

  // Itinerary
  if (lastMsg.includes('itinerary') || lastMsg.includes('plan') || lastMsg.includes('schedule') || lastMsg.includes('day by day') || lastMsg.includes('day 1') || lastMsg.includes('first day')) {
    return getItineraryAdvice(lastMsg, context);
  }

  // Restaurants/Food
  if (lastMsg.includes('eat') || lastMsg.includes('food') || lastMsg.includes('restaurant') || lastMsg.includes('dining') || lastMsg.includes('cuisine') || lastMsg.includes('meal')) {
    return getFoodAdvice(lastMsg);
  }

  // Transportation
  if (lastMsg.includes('transport') || lastMsg.includes('get around') || lastMsg.includes('travel between') || lastMsg.includes('flight') || lastMsg.includes('train') || lastMsg.includes('bus') || lastMsg.includes('car rental') || lastMsg.includes('drive')) {
    return getTransportAdvice(lastMsg);
  }

  // Accommodation
  if (lastMsg.includes('hotel') || lastMsg.includes('stay') || lastMsg.includes('accommodation') || lastMsg.includes('hostel') || lastMsg.includes('airbnb') || lastMsg.includes('lodging') || lastMsg.includes('resort')) {
    return getAccommodationAdvice(lastMsg, context);
  }

  // Safety
  if (lastMsg.includes('safe') || lastMsg.includes('safety') || lastMsg.includes('dangerous') || lastMsg.includes('secure') || lastMsg.includes('emergency')) {
    return getSafetyAdvice(lastMsg);
  }

  // Weather/Best time
  if (lastMsg.includes('weather') || lastMsg.includes('best time') || lastMsg.includes('season') || lastMsg.includes('climate') || lastMsg.includes('when to go') || lastMsg.includes('month')) {
    return getWeatherAdvice(lastMsg);
  }

  // General tips
  if (lastMsg.includes('tip') || lastMsg.includes('advice') || lastMsg.includes('suggestion') || lastMsg.includes('recommend') || lastMsg.includes('hack') || lastMsg.includes('guide')) {
    return getGeneralTips(lastMsg, context);
  }

  // Greetings
  if (lastMsg.includes('hello') || lastMsg.includes('hi ') || lastMsg.includes('hey') || lastMsg === 'hi' || lastMsg === 'hello') {
    return `Hello! 👋 I'm your TravelMate AI assistant. I can help you with:\n\n🌍 **Destination info** — "Tell me about Paris"\n🧳 **Packing lists** — "What should I pack for a beach trip?"\n💰 **Budget planning** — "How much should I budget for Japan?"\n🗺️ **Itinerary ideas** — "Plan a 5-day trip to Rome"\n🍽️ **Food recommendations** — "Best local food in Thailand"\n🚗 **Transportation** — "How to get around Tokyo"\n🏨 **Accommodation** — "Where to stay in Bali"\n\nWhat would you like help with? 😊`;
  }

  if (lastMsg.includes('thank') || lastMsg.includes('thanks')) {
    return "You're welcome! 😊 Happy travels! If you have more questions, I'm here to help.";
  }

  // Default
  return `I'm here to help with your travel planning! 🌟

I can assist with:
• **Destinations** — Things to do, best time to visit, local tips
• **Packing** — What to bring for any trip type
• **Budget** — Cost estimates and money-saving tips
• **Itineraries** — Day-by-day plans and activity suggestions
• **Food & Dining** — Local cuisine and restaurant tips
• **Transport** — Getting around and between places
• **Accommodation** — Where to stay suggestions

Just ask me anything about your trip! 🗺️✈️`;
}

function getDestinationAdvice(query) {
  const destinations = {
    paris: {
      tips: `**Paris 🇫🇷** — The City of Light

**Must-See:** Eiffel Tower, Louvre Museum, Notre-Dame, Montmartre, Musée d'Orsay
**Local Tip:** Visit the Eiffel Tower at sunset for golden hour views. Book Louvre tickets online in advance to skip queues.
**Food:** Try fresh croissants from a local boulangerie, steak frites at a bistro, and macarons from Ladurée.
**Day Trip:** Versailles Palace is just 45min by train.`,
    },
    tokyo: {
      tips: `**Tokyo 🇯🇵** — A blend of tradition and futurism

**Must-See:** Shibuya Crossing, Senso-ji Temple, Meiji Shrine, Akihabara, Shinjuku Gyeuen
**Local Tip:** Get a Suica/Pasmo card for trains. Visit Tsukiji Outer Market for fresh sushi breakfast.
**Food:** Try ramen at Ichiran, conveyor belt sushi, and authentic izakaya.
**Day Trip:** Kamakura's Great Buddha is 1 hour away.`,
    },
    bali: {
      tips: `**Bali 🇮🇩** — Island of the Gods

**Must-See:** Ubud Rice Terraces, Tanah Lot Temple, Uluwatu Cliffs, Seminyak Beach
**Local Tip:** Rent a scooter for flexible travel. Download Gojek for transport and food delivery.
**Food:** Try Babi Guling (suckling pig), Nasi Goreng, and fresh smoothie bowls.
**Best Area:** Ubud for culture, Seminyak for nightlife, Uluwatu for surf.`,
    },
    rome: {
      tips: `**Rome 🇮🇹** — The Eternal City

**Must-See:** Colosseum, Vatican Museums, Trevi Fountain, Pantheon, Roman Forum
**Local Tip:** Throw a coin into Trevi Fountain (right hand over left shoulder) to ensure your return to Rome.
**Food:** Authentic carbonara, cacio e pepe, and gelato from a proper gelateria (avoid bright colors!).
**Skip the Line:** Book Vatican and Colosseum tickets weeks in advance.`,
    },
    newyork: {
      tips: `**New York City 🇺🇸** — The Big Apple

**Must-See:** Statue of Liberty, Central Park, Times Square, Brooklyn Bridge, MoMA
**Local Tip:** Get a 7-day MetroCard for unlimited subway rides. Many museums have pay-what-you-wish hours.
**Food:** Dollar pizza slices, bagels with lox, and pastrami on rye at Katz's Deli.
**Off the Path:** Explore neighborhoods like Williamsburg, Astoria, and Greenwich Village.`,
    },
    london: {
      tips: `**London 🇬🇧** — A global city with deep history

**Must-See:** Tower of London, British Museum, Buckingham Palace, London Eye, Tower Bridge
**Local Tip:** Most major museums are FREE. Get an Oyster card for tube travel.
**Food:** Sunday roast at a proper pub, fish and chips, afternoon tea at Sketch or Fortnum & Mason.
**Day Trip:** Windsor Castle, Stonehenge, or Oxford are easy day trips.`,
    },
    dubai: {
      tips: `**Dubai 🇦🇪** — City of superlatives

**Must-See:** Burj Khalifa, Palm Jumeirah, Dubai Mall, Old Souks, Desert Safari
**Local Tip:** Visit in winter (Nov-Mar) when temps are pleasant. Use the Dubai Metro to avoid traffic.
**Food:** Try shawarma, camel burger, and dine at Pierchic for views.
**Budget:** Fine dining and luxury hotels dominate, but there are great mid-range options in newer areas.`,
    },
    thailand: {
      tips: `**Thailand 🇹🇭** — Land of Smiles

**Must-See:** Grand Palace (Bangkok), Phi Phi Islands, Chiang Mai temples, Railay Beach
**Local Tip:** Learn basic Thai phrases — "Sawadee krap/ka" (hello) goes a long way.
**Food:** Pad Thai, Tom Yum Goong, Mango Sticky Rice, and street food is both amazing and cheap!
**Travel:** Overnight trains and budget airlines connect major destinations.`,
    },
  };

  // Try to find a matching destination
  for (const [key, value] of Object.entries(destinations)) {
    if (query.includes(key)) {
      return value.tips;
    }
  }

  return `**🌍 Destination Travel Tips**

Here are some general tips for any destination:

• **Research local customs** — Learn basic phrases and dress codes
• **Book accommodation in advance** — Especially during peak season
• **Get travel insurance** — Always worth the peace of mind
• **Download offline maps** — Google Maps allows offline area downloads
• **Check visa requirements** — Well before your travel date
• **Notify your bank** — Avoid card blocks abroad

What specific destination are you interested in? I have detailed guides for Paris, Tokyo, Bali, Rome, NYC, London, Dubai, Thailand, and more! 😊`;
}

function getPackingAdvice(query, context) {
  const dest = (context.destination || query).toLowerCase();

  if (dest.includes('beach') || dest.includes('bali') || dest.includes('maldives') || dest.includes('hawaii') || dest.includes('tropical') || dest.includes('phuket') || dest.includes('goa')) {
    return `**🏖️ Beach/Tropical Packing List**

**Clothing:** Swimsuits (2-3), cover-ups, light dresses/shorts, tank tops, wide-brim hat, flip-flops, sandals
**Sun Protection:** SPF 50+ sunscreen (reef-safe), aloe vera, sunglasses, lip balm with SPF
**Essentials:** Reef-safe insect repellent, dry bag, waterproof phone case, rash guard
**Health:** Motion sickness tablets (for boat trips), antihistamines, after-sun lotion
**Extras:** Snorkel gear (if you have your own), reusable water bottle, beach towel`;
  }

  if (dest.includes('ski') || dest.includes('snow') || dest.includes('winter') || dest.includes('mountain') || dest.includes('switzerland') || dest.includes('alps')) {
    return `**❄️ Winter/Ski Trip Packing List**

**Clothing:** Thermal base layers, fleece mid-layer, waterproof ski jacket & pants, wool socks (3-4 pairs), neck gaiter, beanie, waterproof gloves
**Gear:** Ski goggles, helmet, hand warmers, lip balm with SPF, boot bag
**Footwear:** Waterproof winter boots with good grip
**Health:** High-UV sunscreen (snow reflects sun!), moisturizer, lip balm, pain relievers
**Extras:** Hand warmers, portable charger (cold drains batteries), ski lock, CamelBak for hydration`;
  }

  if (dest.includes('city') || dest.includes('paris') || dest.includes('london') || dest.includes('nyc') || dest.includes('rome') || dest.includes('tokyo') || dest.includes('europe') || dest.includes('dubai')) {
    return `**🏙️ City Trip Packing List**

**Clothing:** Comfortable walking shoes (crucial!), versatile outfits (layers), light jacket/blazer, scarf, one dressy outfit
**Day Bag:** Cross-body anti-theft bag, reusable tote
**Tech:** Portable charger, universal adapter, e-reader, noise-cancelling earplugs
**Documents:** Passport copies (digital + physical), printed hotel bookings, travel insurance
**Health:** Blister plasters, pain relievers, hand sanitizer, face masks
**Extras:** Reusable water bottle, small umbrella, travel journal`;
  }

  return `**🧳 General Packing Tips**

**The Golden Rule:** Pack half the clothes and twice the money you think you need!

**Always Pack:**
- Comfortable walking shoes (wear them on the plane)
- Universal power adapter
- Portable charger / power bank
- Basic first-aid kit
- Reusable water bottle
- Packing cubes (game changer!)
- Digital copies of important documents

**Pro Tip:** Roll your clothes rather than folding — saves space and reduces wrinkles! Use the 3-1-1 rule for liquids (3.4oz/100ml containers in 1 quart bag, 1 bag per passenger).

Tell me your destination type (beach, city, winter, adventure) and I'll give you a specific list! 😊`;
}

function getBudgetAdvice(query, context) {
  const dest = (context.destination || query).toLowerCase();

  if (dest.includes('europe') || dest.includes('paris') || dest.includes('london') || dest.includes('switzerland') || dest.includes('scandinavia') || dest.includes('iceland')) {
    return `**💰 Europe Budget Guide**

**Daily Budget (per person):**
• 🎒 **Backpacker:** $60-100/day (hostels, street food, public transport)
• 🏨 **Mid-range:** $150-250/day (3-star hotels, casual dining, some attractions)
• ✨ **Luxury:** $350+/day (4-5 star hotels, fine dining, private tours)

**Money-Saving Tips:**
• Travel off-season (Apr-May or Sep-Oct) for 30-50% savings
• Book flights 2-3 months ahead for best prices
• Eat lunch at local markets/cafes instead of tourist restaurants
• Use city tourist cards for free/discounted attractions
• Walk or use public bikes instead of taxis`;
  }

  if (dest.includes('asia') || dest.includes('thailand') || dest.includes('vietnam') || dest.includes('bali') || dest.includes('india') || dest.includes('cambodia') || dest.includes('laos')) {
    return `**💰 Southeast Asia Budget Guide**

**Daily Budget (per person):**
• 🎒 **Backpacker:** $25-45/day (dorms, street food, local transport)
• 🏨 **Mid-range:** $60-100/day (private room, nice restaurants, some tours)
• ✨ **Luxury:** $150+/day (resorts, fine dining, private drivers)

**Money-Saving Tips:**
• Eat street food — it's the cheapest AND most delicious!
• Use Grab/Gojek instead of taxis
• Book tours locally rather than online (half the price)
• Stay a bit outside the main tourist areas
• Travel between cities by overnight train/bus (saves accommodation)`;
  }

  if (dest.includes('usa') || dest.includes('japan') || dest.includes('australia') || dest.includes('dubai')) {
    return `**💰 Premium Destination Budget Guide**

**Daily Budget (per person):**
• 🎒 **Backpacker:** $80-130/day (budget hotels, convenience store meals, public transport)
• 🏨 **Mid-range:** $200-350/day (nice hotels, good restaurants, attractions)
• ✨ **Luxury:** $500+/day (luxury hotels, fine dining, private experiences)

**Money-Saving Tips:**
• Visit free attractions and museums
• Get city passes for bundled attraction discounts
• Eat at convenience stores (Japan - 7/11 is amazing!) or food courts
• Use public transport day passes
• Book accommodation slightly outside city center`;
  }

  return `**💰 General Travel Budget Tips**

**Rule of Thumb:**
• 🎒 **Backpacker:** $50-80/day
• 🏨 **Mid-range:** $150-250/day  
• ✨ **Luxury:** $400+/day

**Universal Tips:**
• Use incognito mode when booking flights
• Consider house-sitting or home exchanges for free stays
• Set up travel alerts on flight tracking apps
• Carry a mix of cash and cards
• Notify your bank to avoid frozen cards

What's your destination? I can give you more specific budget estimates! 😊`;
}

function getItineraryAdvice(query, context) {
  const dest = (context.destination || query).toLowerCase();
  const days = context.duration || extractDays(query) || 5;

  if (dest.includes('paris') || dest.includes('france')) {
    return getCityItinerary('Paris 🇫🇷', days, [
      ['Eiffel Tower & Champ de Mars', 'Louvre Museum & Tuileries Garden', 'Montmartre & Sacré-Cœur'],
      ['Notre-Dame & Latin Quarter', 'Musée d\'Orsay & Saint-Germain', 'Champs-Élysées & Arc de Triomphe'],
      ['Versailles Palace', 'Luxembourg Gardens', 'Seine River Cruise at sunset'],
    ]);
  }

  if (dest.includes('tokyo') || dest.includes('japan')) {
    return getCityItinerary('Tokyo 🇯🇵', days, [
      ['Senso-ji Temple & Asakusa', 'Akihabara Electric Town', 'Shinjuku at night'],
      ['Meiji Shrine & Harajuku', 'Shibuya Crossing & Hachiko', 'Roppongi Hills night views'],
      ['Tsukiji Outer Market', 'teamLab Borderless', 'Odaiba & Rainbow Bridge'],
    ]);
  }

  if (dest.includes('rome') || dest.includes('italy')) {
    return getCityItinerary('Rome 🇮🇹', days, [
      ['Colosseum & Roman Forum', 'Pantheon & Piazza Navona', 'Trevi Fountain & Spanish Steps'],
      ['Vatican Museums & Sistine Chapel', 'St. Peter\'s Basilica', 'Trastevere dinner'],
      ['Borghese Gallery', 'Appian Way bike ride', 'Sunset at Gianicolo Hill'],
    ]);
  }

  if (dest.includes('bali')) {
    return getCityItinerary('Bali 🇮🇩', days, [
      ['Ubud Rice Terraces', 'Monkey Forest', 'Ubud Palace & Night Market'],
      ['Tanah Lot Temple', 'Seminyak Beach', 'Sunset at beach club'],
      ['Uluwatu Cliffs & Temple', 'Padang Padang Beach', 'Kecak dance at sunset'],
    ]);
  }

  if (dest.includes('bangkok') || dest.includes('thailand')) {
    return getCityItinerary('Bangkok 🇹🇭', days, [
      ['Grand Palace & Wat Phra Kaew', 'Wat Pho & Reclining Buddha', 'Khao San Road'],
      ['Chatuchak Weekend Market', 'Chinatown food tour', 'Sky bar sunset'],
      ['Ayutthaya day trip', 'Floating markets', 'Muay Thai match'],
    ]);
  }

  return `**🗺️ Sample ${days}-Day Trip Itinerary Template**

**Day 1 — Arrival & Explore**
• Morning: Arrive, check in, rest
• Afternoon: Light exploration of the main area
• Evening: Welcome dinner at a local restaurant

**Day 2 — Main Attractions**
• Morning: Visit the #1 attraction
• Afternoon: Explore a museum or cultural site
• Evening: Evening entertainment or night market

**Day 3 — Day Trip or Activity**
• Full day: Day trip to nearby attraction or outdoor activity
• Evening: Relaxed dinner

${days >= 4 ? `**Day 4 — Local Experience**
• Morning: Food tour or cooking class
• Afternoon: Shopping in local markets
• Evening: Sunset viewpoint\n` : ''}
${days >= 5 ? `**Day 5 — Departure**
• Morning: Last-minute sightseeing
• Afternoon: Airport transfer
• Evening: Fly out ✈️\n` : ''}

**Pro Tip:** Always leave some flexible time — the best travel moments are often unplanned! 😊`;
}

function getCityItinerary(cityName, days, suggestions) {
  let itinerary = `**🗺️ ${days}-Day ${cityName} Itinerary**\n\n`;
  for (let i = 0; i < Math.min(days, suggestions.length); i++) {
    itinerary += `**Day ${i + 1}**\n`;
    itinerary += `• Morning: ${suggestions[i][0]}\n`;
    itinerary += `• Afternoon: ${suggestions[i][1]}\n`;
    itinerary += `• Evening: ${suggestions[i][2]}\n\n`;
  }
  itinerary += `**Pro Tip:** Book popular attractions in advance to skip lines! 🎟️`;
  return itinerary;
}

function getFoodAdvice(query) {
  const dest = query.toLowerCase();

  if (dest.includes('italy') || dest.includes('rome') || dest.includes('italian')) {
    return `**🍝 Italian Food Guide**

**Must-Try Dishes:**
• Pasta Carbonara (Rome) — egg, pecorino, guanciale (NO cream!)
• Pizza Margherita (Naples) — the original
• Risotto alla Milanese (Milan) — saffron risotto
• Gelato — look for natural colors, not bright neon
• Tiramisu — coffee-flavored layered dessert

**Tips:** Eat pasta for lunch (cheaper), avoid restaurants with pictures on menus (tourist traps!), and always order a side salad.`;
  }

  if (dest.includes('japan') || dest.includes('tokyo') || dest.includes('japanese')) {
    return `**🍜 Japanese Food Guide**

**Must-Try Dishes:**
• Ramen — regional varieties: Tonkotsu (Fukuoka), Shoyu (Tokyo), Miso (Hokkaido)
• Sushi — trust the conveyor belt or visit Tsukiji for breakfast sushi
• Okonomiyaki — savory pancake, specialty of Osaka
• Takoyaki — octopus balls, perfect street snack
• Matcha desserts — from ice cream to tiramisu

**Tips:** Convenience stores (7/11, FamilyMart) have amazing food! Bow before eating — "Itadakimasu." Slurping noodles is polite!`;
  }

  if (dest.includes('thailand') || dest.includes('thai') || dest.includes('bangkok')) {
    return `**🍜 Thai Food Guide**

**Must-Try Dishes:**
• Pad Thai — stir-fried noodles (street version is best)
• Tom Yum Goong — spicy shrimp soup
• Green Curry — fragrant coconut curry
• Mango Sticky Rice — sweet dessert
• Som Tum — spicy papaya salad

**Tips:** Eat where locals eat — busy stalls = good food! Street food is safe and delicious. Say "Mai pet" for mild spice.`;
  }

  return `**🍽️ Travel Food Tips**

**General Advice:**
• Eat where locals eat — if it's busy, it's good!
• Try street food — often the most authentic and affordable
• Learn "delicious" in the local language
• Stay hydrated, but avoid tap water in many countries
• Carry digestive aids — new cuisines can be surprising!

**What cuisine are you interested in? I have guides for Italian, Japanese, Thai, and more! 😊**`;
}

function getTransportAdvice(query) {
  const dest = query.toLowerCase();

  if (dest.includes('japan') || dest.includes('tokyo')) {
    return `**🚄 Japan Transport Guide**

• **JR Pass** — Essential for long-distance travel (7/14/21 day passes save big)
• **Suica/Pasmo** — Rechargeable IC card for trains, buses, and convenience stores
• **Shinkansen (Bullet Train)** — Book reserved seats for busy routes
• **City Tips:** Tokyo's subway is efficient but complex — Google Maps is your friend
• **Taxis** — Very expensive, use only for short distances or late night`;
  }

  if (dest.includes('europe') || dest.includes('paris') || dest.includes('london') || dest.includes('rome')) {
    return `**🚆 Europe Transport Guide**

• **Trains** — Best for city-to-city (Eurail/Interrail passes available)
• **Budget Airlines** — Ryanair, EasyJet for long distances (book early!)
• **City Tips:** Use metro/subway in major cities, buy multi-day passes
• **Uber/Bolt** — Available in most cities, cheaper than taxis
• **Walking** — Many European cities are very walkable
• **Bikes** — Rent bikes (Lime, city bike shares) for short trips`;
  }

  return `**🚗 General Transport Tips**

• **Research passes** — Many cities offer tourist travel cards
• **Download ride-sharing apps** — Uber, Grab, Gojek, Bolt (varies by region)
• **Book trains in advance** — Especially high-speed and overnight trains
• **Walking is best** — You see so much more on foot!
• **Consider bike rentals** — Many cities have excellent bike infrastructure
• **Avoid taxis at airports** — Use trains/shuttles or pre-book`;
}

function getAccommodationAdvice(query, context) {
  return `**🏨 Accommodation Tips**

**Choosing Where to Stay:**
• Stay near public transport — saves time and money
• Read recent reviews (last 3 months)
• Check for hidden fees (resort fees, cleaning fees)
• Consider apartments for longer stays (more space, kitchen)
• Hostels aren't just for backpackers — many have private rooms now!

**Booking Tips:**
• Book directly with hotels for best cancellation policies
• Use comparison sites but cross-check with hotel website
• Look for free cancellation options
• Join loyalty programs for perks

**What type of trip are you planning?** I can suggest specific areas to stay in!`;
}

function getSafetyAdvice(query) {
  return `**🛡️ Travel Safety Tips**

**Before You Go:**
• Register with your embassy if traveling to remote areas
• Share your itinerary with family/friends
• Download offline maps and emergency numbers
• Get comprehensive travel insurance

**During Your Trip:**
• Keep valuables in hotel safe
• Use anti-theft bags in crowded areas
• Stay aware of surroundings, especially at night
• Trust your instincts — if a place feels unsafe, leave
• Keep digital copies of passport and visa

**Emergency Kit:** First-aid supplies, emergency contact numbers, insurance details, and a small flashlight.

**Remember:** Most destinations are perfectly safe for travelers who use common sense! 😊`;
}

function getWeatherAdvice(query) {
  return `**🌤️ Best Time to Travel Guide**

**General Seasons:**
• 🌸 **Spring (Mar-May):** Mild temps, flowers bloom, fewer crowds
• ☀️ **Summer (Jun-Aug):** Peak season, hot, expensive, crowded
• 🍂 **Fall (Sep-Nov):** Pleasant weather, harvest season, fewer tourists
• ❄️ **Winter (Dec-Feb):** Cold, low season (except ski resorts), cheapest

**Regional Tips:**
• **Europe:** May-Jun or Sep-Oct for best weather & fewer crowds
• **Southeast Asia:** Nov-Feb is dry season (best time)
• **Japan:** Mar-May (cherry blossoms) or Oct-Nov (fall colors)
• **Caribbean:** Dec-Apr (dry season), May-Nov (hurricane risk)

**What destination are you interested in?** I can give you specific weather advice! 😊`;
}

function getGeneralTips(query, context) {
  return `**🌟 Essential Travel Tips**

**Before Departure:**
• Make copies of passport, visa, and important documents
• Set up online banking and notify your bank
• Download offline maps, translation apps, and entertainment
• Pack a basic first-aid kit
• Check travel advisories for your destination

**During Your Trip:**
• Start each day with a rough plan but stay flexible
• Talk to locals — they know the best spots!
• Take photos but also put the phone down and soak it in
• Try one new thing every day
• Stay hydrated and get enough rest

**The Traveler's Mindset:**
"Travel is the only thing you buy that makes you richer." — Anonymous

**Where are you heading?** I'd love to give you specific tips! 😊`;
}

function extractDays(text) {
  const match = text.match(/(\d+)\s*[- ]?day/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Generate a chat title based on the first user message
 */
function generateTitle(message) {
  const msg = message.toLowerCase();
  if (msg.includes('paris')) return 'Paris Travel Planning';
  if (msg.includes('tokyo')) return 'Tokyo Travel Planning';
  if (msg.includes('bali')) return 'Bali Travel Planning';
  if (msg.includes('rome')) return 'Rome Travel Planning';
  if (msg.includes('london')) return 'London Travel Planning';
  if (msg.includes('thailand')) return 'Thailand Travel Planning';
  if (msg.includes('packing') || msg.includes('pack')) return 'Packing Assistance';
  if (msg.includes('budget') || msg.includes('cost') || msg.includes('money')) return 'Budget Planning';
  if (msg.includes('itinerary') || msg.includes('plan')) return 'Itinerary Planning';
  if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi' || msg === 'hello') return 'Travel Assistance';
  if (msg.includes('eat') || msg.includes('food') || msg.includes('restaurant')) return 'Food & Dining Guide';
  return 'TravelMate AI Chat';
}

module.exports = {
  getOpenAIResponse,
  getRuleBasedResponse,
  generateTitle,
};
