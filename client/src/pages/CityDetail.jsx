import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiMapPin, FiStar, FiPlusCircle, FiLock, FiAward, FiClock, FiDollarSign, FiGlobe, FiSun, FiInfo, FiHome, FiCoffee } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

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

const categoryIcons = {
  landmark: '🏛️', museum: '🏛️', nature: '🌿', food: '🍽️',
  shopping: '🛍️', nightlife: '🌙', other: '📍',
};

const CityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('attractions');

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cityRes, wishRes] = await Promise.allSettled([
          api.get(`/cities/${slug}`),
          api.get('/destinations/wishlist/me'),
        ]);
        if (cityRes.status === 'fulfilled') {
          setCity(cityRes.value.data.data);
        } else if (cityRes.status === 'rejected' && cityRes.reason?.response?.status === 403) {
          setPremiumBlocked(true);
        }
        if (wishRes.status === 'fulfilled') {
          const items = wishRes.value.data.data?.destinations || [];
          setInWishlist(items.some((d) => d.destination?._id === slug));
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  const toggleWishlist = async () => {
    try {
      if (inWishlist) {
        await api.delete(`/destinations/wishlist/${slug}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/destinations/wishlist', { destinationId: city._id, itemType: 'City' });
        setInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handlePlanTrip = () => {
    const countryName = typeof city.country === 'object' ? city.country?.name : city.country || '';
    navigate('/trips/new', {
      state: {
        fromDestination: {
          title: `Trip to ${city.name}`,
          destination: city.name,
          country: countryName,
          description: city.description,
          budget: city.estimatedBudget?.min || '',
          currency: city.estimatedBudget?.currency || 'USD',
        },
      },
    });
  };

  const getCountryName = () => {
    if (typeof city.country === 'object' && city.country?.name) return city.country.name;
    return city.country || '';
  };

  const getCountrySlug = () => {
    if (typeof city.country === 'object' && city.country?.slug) return city.country.slug;
    return '';
  };

  const getRating = () => {
    if (!city.attractions || city.attractions.length === 0) return '0.0';
    const sum = city.attractions.reduce((s, a) => s + (a.rating || 0), 0);
    return (sum / city.attractions.length).toFixed(1);
  };

  if (loading) {
    return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>;
  }

  if (premiumBlocked) {
    return (
      <div>
        <Link to="/destinations" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Destinations
        </Link>
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Premium City</h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-2">
            This city is available exclusively on the <strong>Pro</strong> and <strong>Team</strong> plans.
          </p>
          <p className="text-sm text-dark-400 max-w-md mx-auto mb-8">
            Upgrade to access detailed guides, hotel recommendations, restaurant picks, and travel tips.
          </p>
          <Link
            to="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            <FiAward className="w-4 h-4" />
            Upgrade to Unlock
          </Link>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="card p-16 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold mb-2">City Not Found</h3>
        <Link to="/destinations" className="text-primary-500 hover:underline">← Back to Destinations</Link>
      </div>
    );
  }

  const emoji = emojiMap[city.name] || '📍';
  const countryName = getCountryName();
  const countrySlug = getCountrySlug();
  const avgRating = getRating();
  const tabs = [
    { id: 'attractions', label: 'Attractions', icon: '🏛️', count: city.attractions?.length || 0 },
    { id: 'hotels', label: 'Hotels', icon: '🏨', count: city.hotels?.length || 0 },
    { id: 'restaurants', label: 'Restaurants', icon: '🍽️', count: city.restaurants?.length || 0 },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mb-6">
        <Link to="/destinations" className="hover:text-primary-500 transition-colors">Destinations</Link>
        <span>/</span>
        {countrySlug ? (
          <Link to={`/explore/${countrySlug}`} className="hover:text-primary-500 transition-colors">{countryName}</Link>
        ) : (
          <span>{countryName}</span>
        )}
        <span>/</span>
        <span className="text-dark-900 dark:text-white font-medium">{city.name}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-8xl relative mb-8">
          {emoji}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            {city.isPremium && (
              <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full font-medium shadow-lg">
                <FiAward className="w-3.5 h-3.5" /> Premium
              </span>
            )}
            {city.isCapital && (
              <span className="text-xs bg-white/90 dark:bg-dark-800/90 text-dark-900 dark:text-white px-3 py-1 rounded-full font-medium shadow-lg">
                🏛️ Capital
              </span>
            )}
            {city.isPopular && (
              <span className="badge-primary text-xs shadow-lg">Popular</span>
            )}
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{city.name}</h1>
                <p className="text-white/80 flex items-center gap-2 text-sm md:text-base">
                  <FiMapPin className="w-4 h-4" /> {countryName}
                </p>
              </div>
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-xl transition-all ${inWishlist ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'}`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-3">About {city.name}</h2>
              <p className="text-dark-600 dark:text-dark-400 leading-relaxed">{city.description}</p>
              {city.funFact && (
                <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
                  <p className="text-sm text-primary-700 dark:text-primary-300 flex items-start gap-2">
                    <FiInfo className="w-4 h-4 mt-0.5 shrink-0" />
                    <span><strong>Did you know?</strong> {city.funFact}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            {tabs.some(t => t.count > 0) && (
              <div className="card p-6">
                <div className="flex gap-2 mb-6 border-b border-dark-200 dark:border-dark-700 pb-3 overflow-x-auto">
                  {tabs.filter(t => t.count > 0).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'text-dark-500 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <span>{tab.icon}</span> {tab.label}
                      <span className="text-xs opacity-70">({tab.count})</span>
                    </button>
                  ))}
                </div>

                {/* Attractions Tab */}
                {activeTab === 'attractions' && city.attractions?.length > 0 && (
                  <div className="space-y-3">
                    {city.attractions.map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl flex-shrink-0">
                          {categoryIcons[attr.category] || '📍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{attr.name}</p>
                          <p className="text-xs text-dark-500 truncate">{attr.description}</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm flex-shrink-0">
                          <FiStar className="w-4 h-4 text-yellow-500" />
                          {attr.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hotels Tab */}
                {activeTab === 'hotels' && city.hotels?.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-3">
                    {city.hotels.map((hotel, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                            <FiHome className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{hotel.name}</p>
                            <p className="text-xs text-dark-500 capitalize">{hotel.type} · ${hotel.pricePerNight}/night</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs"><FiStar className="w-3 h-3 text-yellow-500" />{hotel.rating}</span>
                              {hotel.amenities?.slice(0, 2).map((a, i) => (
                                <span key={i} className="text-[10px] bg-dark-200 dark:bg-dark-600 px-1.5 py-0.5 rounded-full">{a}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Restaurants Tab */}
                {activeTab === 'restaurants' && city.restaurants?.length > 0 && (
                  <div className="space-y-3">
                    {city.restaurants.map((rest, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white flex-shrink-0">
                          <FiCoffee className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{rest.name}</p>
                          <p className="text-xs text-dark-500">{rest.cuisine} · {rest.priceRange}</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm flex-shrink-0">
                          <FiStar className="w-4 h-4 text-yellow-500" />{rest.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Travel Tips */}
            {city.travelTips?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Travel Tips</h2>
                <ul className="space-y-2">
                  {city.travelTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500 flex items-center gap-1.5"><FiGlobe className="w-3.5 h-3.5" /> Country</span>
                  <span className="font-medium">{countryName}</span>
                </div>
                {city.bestTimeToVisit && (
                  <div className="flex justify-between">
                    <span className="text-dark-500 flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5" /> Best Time</span>
                    <span className="font-medium text-xs text-right">{city.bestTimeToVisit}</span>
                  </div>
                )}
                {city.estimatedBudget && (
                  <div className="flex justify-between">
                    <span className="text-dark-500 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" /> Budget</span>
                    <span className="font-medium">{city.estimatedBudget.currency} {city.estimatedBudget.min} - {city.estimatedBudget.max}</span>
                  </div>
                )}
                {city.weather?.temperature && (
                  <div className="flex justify-between">
                    <span className="text-dark-500 flex items-center gap-1.5"><FiSun className="w-3.5 h-3.5" /> Climate</span>
                    <span className="font-medium">{city.weather.temperature}</span>
                  </div>
                )}
                {city.attractions && (
                  <div className="border-t border-dark-200 dark:border-dark-700 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-dark-500">Rating</span>
                      <span className="font-medium flex items-center gap-1"><FiStar className="w-3.5 h-3.5 text-yellow-500" />{avgRating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <button
                onClick={toggleWishlist}
                className={`w-full mb-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  inWishlist
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'bg-gray-50 dark:bg-dark-700 text-dark-700 dark:text-dark-300 border border-dark-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <FiHeart className={`w-4 h-4 inline mr-1.5 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                onClick={handlePlanTrip}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                <FiPlusCircle className="w-4 h-4 inline mr-1.5" />
                Plan a Trip to {city.name}
              </button>

              {city.weather && (
                <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <p className="text-xs text-dark-400 font-medium uppercase tracking-wide mb-2">Weather</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">
                      {city.weather.condition?.toLowerCase().includes('sunny') || city.weather.condition?.toLowerCase().includes('tropical') ? '☀️'
                        : city.weather.condition?.toLowerCase().includes('humid') || city.weather.condition?.toLowerCase().includes('rain') ? '🌧️'
                        : city.weather.condition?.toLowerCase().includes('temperate') || city.weather.condition?.toLowerCase().includes('mediterranean') ? '🌤️'
                        : city.weather.condition?.toLowerCase().includes('cold') || city.weather.condition?.toLowerCase().includes('alpine') ? '❄️'
                        : city.weather.condition?.toLowerCase().includes('continental') ? '🌡️'
                        : '🌤️'}
                    </span>
                    <span className="font-medium">{city.weather.temperature}</span>
                    <span className="text-dark-400">· {city.weather.condition}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Detail */}
            {city.weather?.humidity && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Climate Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-500">Temperature</span>
                    <span className="font-medium">{city.weather.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-500">Condition</span>
                    <span className="font-medium">{city.weather.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-500">Humidity</span>
                    <span className="font-medium">{city.weather.humidity}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CityDetail;
