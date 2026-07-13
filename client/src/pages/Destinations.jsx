import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiHeart, FiLock, FiStar, FiAward, FiMapPin } from 'react-icons/fi';
import api from '../services/api';

const emojiMap = {
  'Paris': '🗼', 'Tokyo': '🗾', 'Bali': '🏝️', 'New York City': '🗽', 'Dubai': '🏙️',
  'Rome': '🏛️', 'Bangkok': '🛕', 'London': '🎡', 'Sydney': '🏄', 'Barcelona': '🏛️',
  'Santorini': '🏛️', 'Maldives': '🏝️',
  'Kyoto': '⛩️', 'Cape Town': '🌊', 'Amalfi Coast': '🏖️',
  'Queenstown': '⛰️', 'Reykjavik': '🌋', 'Nice': '🏖️', 'Lyon': '🏰',
  'Osaka': '🏯', 'Venice': '🚣', 'Florence': '🎨', 'Chiang Mai': '🏔️',
  'Phuket': '🏖️', 'Edinburgh': '🏰', 'Manchester': '⚽', 'San Francisco': '🌉',
  'Chicago': '🌆', 'Melbourne': '🎭', 'Brisbane': '☀️', 'Madrid': '🏛️',
  'Seville': '💃', 'New Delhi': '🕌', 'Mumbai': '🎬', 'Jaipur': '🏰',
  'Abu Dhabi': '🕌', 'Zurich': '🏔️', 'Geneva': '⛲', 'Interlaken': '🏔️',
  'Athens': '🏛️', 'Mykonos': '🏖️', 'Male': '🏝️', 'Auckland': '⛵',
  'Wellington': '🏛️', 'Lima': '🍽️', 'Cusco': '🏔️', 'Johannesburg': '🏙️',
  'Durban': '🏖️', 'Toronto': '🏗️', 'Vancouver': '🌲', 'Montreal': '🏰',
  'Rio de Janeiro': '⛰️', 'São Paulo': '🏙️', 'Salvador': '🎵', 'Cairo': '🐪',
  'Luxor': '🏛️', 'Alexandria': '🏛️',
};

const Destinations = () => {
  const { user } = useSelector((state) => state.auth);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = search ? `?search=${search}&limit=100` : '?limit=100';
        const [cityRes, wishRes] = await Promise.allSettled([
          api.get(`/cities${params}`),
          api.get('/destinations/wishlist/me'),
        ]);
        if (cityRes.status === 'fulfilled') {
          setCities(cityRes.value.data.data || []);
        }
        if (wishRes.status === 'fulfilled') {
          const items = wishRes.value.data.data?.destinations || [];
          setWishlistIds(new Set(items.map((d) => d.destination?._id).filter(Boolean)));
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchData();
  }, [search]);

  const getCountryName = (city) => {
    if (typeof city.country === 'object' && city.country?.name) return city.country.name;
    return '';
  };

  const getCountrySlug = (city) => {
    if (typeof city.country === 'object' && city.country?.slug) return city.country.slug;
    return '';
  };

  const getRating = (city) => {
    if (!city.attractions || city.attractions.length === 0) return '0.0';
    const sum = city.attractions.reduce((s, a) => s + (a.rating || 0), 0);
    return (sum / city.attractions.length).toFixed(1);
  };

  const premiumCities = cities.filter(c => c.isPremium);
  const freeCities = cities.filter(c => !c.isPremium);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
        <p className="text-dark-500 dark:text-dark-400">
          Discover {cities.length} amazing cities across the world
        </p>
      </div>

      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search cities..."
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      ) : isFreePlan ? (
        /* Free users see upgrade prompt instead of cities */
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Destinations are Pro Feature</h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-6">
            Explore <strong>108+ cities</strong> across <strong>48 countries</strong> worldwide with detailed guides,
            hotels, restaurants, and travel tips. Upgrade to <strong>Pro</strong> or <strong>Team</strong> to unlock all destinations.
          </p>
          <Link
            to="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <FiStar className="w-5 h-5" />
            View Plans
          </Link>
          <p className="text-xs text-dark-400 mt-4">
            Already a subscriber? <Link to="/auth/login" className="text-primary-500 hover:underline">Sign in</Link>
          </p>
        </div>
      ) : cities.length > 0 ? (
        <div>
          {/* All Cities for subscribed users */}
          {freeCities.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🌍</span> Popular Destinations
                <span className="text-sm text-dark-400 font-normal">({freeCities.length} cities)</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeCities.map((city, idx) => (
                  <CityCard key={city._id} city={city} idx={idx} isFreePlan={isFreePlan}
                    getCountryName={getCountryName} getCountrySlug={getCountrySlug} getRating={getRating} />
                ))}
              </div>
            </div>
          )}

          {/* Premium Cities */}
          {premiumCities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-violet-500" /> Premium Destinations
                <span className="text-sm text-dark-400 font-normal">({premiumCities.length} cities)</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumCities.map((city, idx) => (
                  <CityCard key={city._id} city={city} idx={idx} isFreePlan={isFreePlan}
                    getCountryName={getCountryName} getCountrySlug={getCountrySlug} getRating={getRating} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2">No Destinations Found</h3>
          <p className="text-dark-500 dark:text-dark-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

const CityCard = ({ city, idx, isFreePlan, getCountryName, getCountrySlug, getRating }) => {
  const isLocked = city.isPremium && isFreePlan;
  const countryName = getCountryName(city);
  const countrySlug = getCountrySlug(city);
  const emoji = emojiMap[city.name] || '📍';
  const avgRating = getRating(city);

  const cardContent = (
    <div className={`card overflow-hidden group ${isLocked ? 'opacity-75' : 'hover:shadow-lg hover:shadow-primary-500/5 transition-all'}`}>
      <div className={`h-40 bg-gradient-to-br ${city.isPremium ? 'from-violet-500 to-purple-600' : 'from-primary-400 to-accent-500'} flex items-center justify-center text-5xl relative`}>
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <FiLock className="w-8 h-8 text-white" />
          </div>
        )}
        {emoji}
        {city.isCapital && (
          <span className="absolute top-3 left-3 text-xs bg-white/90 dark:bg-dark-800/90 text-dark-900 dark:text-white px-2 py-0.5 rounded-full font-medium shadow">
            🏛️ Capital
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{city.name}</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 flex items-center gap-1">
              <FiMapPin className="w-3 h-3" /> {countryName}
            </p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {city.isPopular && <span className="badge-primary text-xs">Popular</span>}
            {city.isPremium && (
              <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                <FiAward className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-2 line-clamp-2">{city.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-3">
            {city.estimatedBudget && (
              <span>💰 {city.estimatedBudget.currency} {city.estimatedBudget.min}</span>
            )}
            {city.attractions && (
              <span>🏛️ {city.attractions.length}</span>
            )}
          </div>
          <span>⭐ {avgRating}</span>
        </div>
        {isLocked && (
          <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
            <Link
              to="/settings?tab=plan"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <FiAward className="w-4 h-4" />
              Upgrade to Unlock
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
    >
      {isLocked ? cardContent : (
        <Link to={`/destinations/city/${city.slug || city._id}`} className="block">
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
};

export default Destinations;
