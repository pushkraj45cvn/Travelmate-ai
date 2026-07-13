import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiAward, FiGlobe, FiLock, FiChevronRight, FiStar } from 'react-icons/fi';
import api from '../services/api';

const continentEmojis = {
  'Europe': '🌍',
  'Asia': '🌏',
  'North America': '🌎',
  'South America': '🌎',
  'Africa': '🌍',
  'Oceania': '🌏',
  'Antarctica': '❄️',
};

const continentColors = {
  'Europe': 'from-blue-500 to-indigo-600',
  'Asia': 'from-red-500 to-orange-600',
  'North America': 'from-green-500 to-teal-600',
  'South America': 'from-emerald-500 to-green-600',
  'Africa': 'from-amber-500 to-orange-600',
  'Oceania': 'from-cyan-500 to-blue-600',
};

const Explore = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContinent, setActiveContinent] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contRes, countryRes] = await Promise.allSettled([
          api.get('/countries/continents'),
          api.get('/countries'),
        ]);

        if (contRes.status === 'fulfilled') {
          setContinents(contRes.value.data.data || []);
        }
        if (countryRes.status === 'fulfilled') {
          setAllCountries(countryRes.value.data.data || []);
        }
        if (contRes.status === 'rejected') {
          setError('Failed to load destinations. Please try again.');
        }
      } catch (err) {
        setError('Failed to load destinations.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter countries by search
  const filteredCountries = search
    ? allCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.continent.toLowerCase().includes(search.toLowerCase())
      )
    : allCountries;

  // Group filtered by continent for "all" view
  const groupedByContinent = {};
  for (const country of filteredCountries) {
    const cont = country.continent || 'Other';
    if (!groupedByContinent[cont]) groupedByContinent[cont] = [];
    groupedByContinent[cont].push(country);
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton h-12 w-64 rounded-xl mb-8" />
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-24 w-32 rounded-xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-16 text-center">
        <div className="text-6xl mb-4">🌍</div>
        <h3 className="text-xl font-semibold mb-2">{error}</h3>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FiGlobe className="w-7 h-7 text-primary-500" />
          Explore the World
        </h1>
        <p className="text-dark-500 dark:text-dark-400">
          Browse destinations by continent and discover your next adventure
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search countries or continents..."
        />
      </div>

      {/* Continent Pills */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveContinent(null)}
          className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            !activeContinent
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
          }`}
        >
          🌐 All Continents
        </button>
        {continents.map((cont) => (
          <button
            key={cont._id}
            onClick={() => setActiveContinent(activeContinent === cont._id ? null : cont._id)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeContinent === cont._id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
            }`}
          >
            <span>{continentEmojis[cont._id] || '🌍'}</span>
            {cont._id}
            <span className="text-xs opacity-60">({cont.countryCount})</span>
          </button>
        ))}
      </div>

      {search && filteredCountries.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-dark-500 dark:text-dark-400">Try a different search term</p>
        </div>
      ) : search ? (
        /* Search results - flat list */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country, idx) => (
            <CountryCard key={country._id} country={country} idx={idx} isFreePlan={isFreePlan} />
          ))}
        </div>
      ) : activeContinent ? (
        /* Single continent view */
        <div>
          {continents
            .filter((c) => c._id === activeContinent)
            .map((cont) => (
              <div key={cont._id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{continentEmojis[cont._id] || '🌍'}</span>
                  <h2 className="text-2xl font-bold">{cont._id}</h2>
                  <span className="text-sm text-dark-400">({cont.countryCount} countries)</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cont.countries.map((country, idx) => (
                    <CountryCard key={country.slug} country={country} idx={idx} isFreePlan={isFreePlan} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* All continents view */
        <div className="space-y-12">
          {continents.map((cont) => (
            <div key={cont._id}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{continentEmojis[cont._id] || '🌍'}</span>
                  <h2 className="text-xl font-bold">{cont._id}</h2>
                  <span className="text-sm text-dark-400">({cont.countryCount})</span>
                </div>
                <button
                  onClick={() => setActiveContinent(cont._id)}
                  className="text-sm text-primary-500 hover:underline flex items-center gap-1"
                >
                  View All <FiChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cont.countries.slice(0, 6).map((country, idx) => (
                  <CountryCard key={country.slug} country={country} idx={idx} isFreePlan={isFreePlan} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade prompt for free users */}
      {isFreePlan && (
        <div className="card p-6 mt-8 text-center border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/10">
          <FiAward className="w-8 h-8 mx-auto mb-3 text-violet-500" />
          <h3 className="text-lg font-bold mb-1">Unlock Premium Countries</h3>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            Upgrade to <strong>Pro</strong> or <strong>Team</strong> to access premium countries
            with detailed city guides, hotels, restaurants, and expert travel tips.
          </p>
          <Link
            to="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm"
          >
            <FiStar className="w-4 h-4" />
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
};

const CountryCard = ({ country, idx, isFreePlan }) => {
  const isLocked = country.isPremium && isFreePlan;
  const cardContent = (
    <div className={`card overflow-hidden group ${isLocked ? 'opacity-75' : ''}`}>
      <div className={`h-40 bg-gradient-to-br ${country.isPremium ? 'from-violet-500 to-purple-600' : 'from-primary-400 to-accent-500'} flex items-center justify-center text-5xl relative`}>
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <FiLock className="w-8 h-8 text-white" />
          </div>
        )}
        <span className="text-5xl">{country.flag || continentEmojis[country.continent] || '🌍'}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{country.name}</h3>
            <p className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-1">
              <span className="text-xs">{continentEmojis[country.continent] || '🌍'}</span>
              {country.continent}
            </p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {country.isPopular && <span className="badge-primary text-[10px]">Popular</span>}
            {country.isPremium && (
              <span className="flex items-center gap-0.5 text-[10px] bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                <FiAward className="w-2.5 h-2.5" /> Premium
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2 mb-3">
          {country.description}
        </p>
        <div className="text-xs text-dark-400 flex items-center gap-3">
          <span>💱 {country.currency?.code}</span>
          <span>🏛️ {country.capital}</span>
        </div>
        {isLocked && (
          <div className="mt-3 pt-3 border-t border-dark-200 dark:border-dark-700">
            <Link
              to="/settings?tab=plan"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <FiAward className="w-3 h-3" />
              Upgrade to Unlock
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.03 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
    >
      <Link to={`/explore/${country.slug}`} className="block">
        {cardContent}
      </Link>
    </motion.div>
  );
};

export default Explore;
