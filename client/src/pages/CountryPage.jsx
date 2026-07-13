import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiAward, FiLock, FiStar, FiClock, FiDollarSign, FiGlobe, FiShield, FiInfo } from 'react-icons/fi';
import api from '../services/api';

const continentEmojis = {
  'Europe': '🌍',
  'Asia': '🌏',
  'North America': '🌎',
  'South America': '🌎',
  'Africa': '🌍',
  'Oceania': '🌏',
};

const CountryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const res = await api.get(`/countries/${slug}`);
        setCountry(res.data.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setPremiumBlocked(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [slug]);

  if (loading) {
    return (
      <div>
        <div className="skeleton h-12 w-64 rounded-xl mb-6" />
        <div className="skeleton h-56 rounded-2xl mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (premiumBlocked) {
    return (
      <div>
        <Link to="/explore" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Premium Country</h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-2">
            This country's detailed guides are available exclusively on the <strong>Pro</strong> and <strong>Team</strong> plans.
          </p>
          <p className="text-sm text-dark-400 max-w-md mx-auto mb-8">
            Upgrade to access city guides, hotel recommendations, restaurant picks, and expert travel tips.
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

  if (!country) {
    return (
      <div className="card p-16 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold mb-2">Country Not Found</h3>
        <Link to="/explore" className="text-primary-500 hover:underline">← Back to Explore</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 via-accent-500 to-purple-600 flex items-center justify-center">
          <span className="text-8xl md:text-9xl opacity-30 select-none">{country.flag || '🌍'}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{country.flag || '🌍'}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{country.name}</h1>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <FiGlobe className="w-3.5 h-3.5" />
                  {country.continent}
                  <span className="mx-2">·</span>
                  <FiMapPin className="w-3.5 h-3.5" />
                  {country.capital}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {country.isPremium && (
                <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full font-medium shadow-lg">
                  <FiAward className="w-3 h-3" /> Premium
                </span>
              )}
              {country.isPopular && (
                <span className="badge-primary text-xs shadow-lg">Popular</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="text-xl font-semibold mb-3">About {country.name}</h2>
            <p className="text-dark-600 dark:text-dark-400 leading-relaxed">{country.description}</p>
            {country.funFact && (
              <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300 flex items-start gap-2">
                  <FiInfo className="w-4 h-4 mt-0.5 shrink-0" />
                  <span><strong>Fun Fact:</strong> {country.funFact}</span>
                </p>
              </div>
            )}
          </motion.div>

          {/* Cities */}
          {country.cities && country.cities.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Cities to Explore</h2>
                <span className="text-sm text-dark-400">{country.cities.length} cities</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {country.cities.map((city, idx) => {
                  const isCityLocked = city.isPremium && isFreePlan;
                  const cityCard = (
                    <div className={`card overflow-hidden group ${isCityLocked ? 'opacity-75' : 'hover:shadow-lg hover:shadow-primary-500/5 transition-all'}`}>
                      <div className={`h-32 bg-gradient-to-br ${city.isPremium ? 'from-violet-500 to-purple-600' : 'from-primary-400 to-accent-500'} flex items-center justify-center text-4xl relative`}>
                        {isCityLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <FiLock className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {city.isCapital ? '🏛️' : '📍'}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {city.name}
                              {city.isCapital && <span className="text-xs text-primary-500 ml-1">· Capital</span>}
                            </h3>
                            {city.isPremium && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                                <FiAward className="w-2.5 h-2.5" /> Premium
                              </span>
                            )}
                          </div>
                          {city.estimatedBudget && (
                            <span className="text-xs text-dark-400 flex-shrink-0">
                              {city.estimatedBudget.currency} {city.estimatedBudget.min}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2">{city.description}</p>
                        {city.attractions && (
                          <p className="text-xs text-dark-400 mt-2">
                            🏛️ {city.attractions.length} attractions
                          </p>
                        )}
                        {isCityLocked && (
                          <div className="mt-3 pt-3 border-t border-dark-200 dark:border-dark-700">
                            <Link
                              to="/settings?tab=plan"
                              className="flex items-center justify-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                            >
                              <FiAward className="w-3 h-3" />
                              Upgrade to Explore
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  if (isCityLocked) {
                    return (
                      <motion.div
                        key={city._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        {cityCard}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={city._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Link to={`/destinations/city/${city.slug}`} className="block">
                        {cityCard}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Travel Tips */}
          {country.travelTips && country.travelTips.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Travel Tips for {country.name}</h2>
              <ul className="space-y-2">
                {country.travelTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
            <h3 className="font-semibold mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-dark-500 flex items-center gap-1.5"><FiGlobe className="w-3.5 h-3.5" /> Continent</span>
                <span className="font-medium">{country.continent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> Capital</span>
                <span className="font-medium">{country.capital}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5" /> Best Time</span>
                <span className="font-medium text-xs text-right">{country.bestTimeToVisit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" /> Currency</span>
                <span className="font-medium">{country.currency?.code} ({country.currency?.symbol})</span>
              </div>
              <div className="border-t border-dark-200 dark:border-dark-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-dark-500">Language(s)</span>
                  <span className="font-medium text-xs text-right">{country.languages?.join(', ')}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Timezone</span>
                <span className="font-medium">{country.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Driving</span>
                <span className="font-medium capitalize">{country.drivingSide}-hand</span>
              </div>
            </div>
          </motion.div>

          {/* Visa & Safety */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h3 className="font-semibold mb-4">Travel Information</h3>
            {country.visaInfo && (
              <div className="mb-3">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wide mb-1">🛂 Visa</p>
                <p className="text-sm text-dark-600 dark:text-dark-400">{country.visaInfo}</p>
              </div>
            )}
            {country.healthInfo && (
              <div className="mb-3">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wide mb-1">💊 Health</p>
                <p className="text-sm text-dark-600 dark:text-dark-400">{country.healthInfo}</p>
              </div>
            )}
            {country.safetyInfo && (
              <div>
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
                  <FiShield className="w-3 h-3" /> Safety
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">{country.safetyInfo}</p>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6">
            <h3 className="font-semibold mb-4">Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10">
                <p className="text-2xl font-bold text-primary-500">{country.cities?.length || 0}</p>
                <p className="text-xs text-dark-500">Cities</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10">
                <p className="text-2xl font-bold text-primary-500">{country.stats?.destinationCount || 0}</p>
                <p className="text-xs text-dark-500">Destinations</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CountryPage;
