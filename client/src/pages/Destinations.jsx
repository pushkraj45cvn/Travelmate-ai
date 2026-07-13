import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiHeart, FiLock, FiStar, FiCrown } from 'react-icons/fi';
import api from '../services/api';

const Destinations = () => {
  const { user } = useSelector((state) => state.auth);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = search ? `?search=${search}` : '';
        const [destRes, wishRes] = await Promise.allSettled([
          api.get(`/destinations${params}`),
          api.get('/destinations/wishlist/me'),
        ]);
        if (destRes.status === 'fulfilled') {
          setDestinations(destRes.value.data.data || []);
        }
        if (wishRes.status === 'fulfilled') {
          const items = wishRes.value.data.data?.destinations || [];
          setWishlistIds(new Set(items.map((d) => d.destination?._id).filter(Boolean)));
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchData();
  }, [search]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
        <p className="text-dark-500 dark:text-dark-400">Discover amazing places around the world</p>
      </div>

      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search destinations..."
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, idx) => (
            <motion.div key={dest._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              {dest.isPremium && isFreePlan ? (
                /* Premium destination locked for free users */
                <div className="card overflow-hidden group opacity-75">
                  <div className="h-48 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-6xl relative">
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <FiLock className="w-10 h-10 text-white" />
                    </div>
                    {dest.name === 'Santorini' ? '🏛️' : dest.name === 'Machu Picchu' ? '🏔️' : dest.name === 'Maldives' ? '🏝️' : dest.name === 'Swiss Alps' ? '🏔️' : dest.name === 'Kyoto' ? '⛩️' : dest.name === 'Cape Town' ? '🌊' : dest.name === 'Amalfi Coast' ? '🏖️' : dest.name === 'Banff National Park' ? '🏔️' : dest.name === 'Queenstown' ? '⛰️' : dest.name === 'Reykjavik & Golden Circle' ? '🌋' : '📍'}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dest.name}</h3>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{dest.country}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                        <FiCrown className="w-3 h-3" /> Premium
                      </span>
                    </div>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-3 line-clamp-2">{dest.description}</p>
                    <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                      <Link
                        to="/settings?tab=plan"
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <FiCrown className="w-4 h-4" />
                        Upgrade to Unlock
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Accessible destination card */
                <Link to={`/destinations/${dest._id}`} className="card overflow-hidden group block">
                  <div className={`h-48 bg-gradient-to-br ${dest.isPremium ? 'from-violet-500 to-purple-600' : 'from-primary-400 to-accent-500'} flex items-center justify-center text-6xl`}>
                    {dest.name === 'Paris' ? '🗼' : dest.name === 'Tokyo' ? '🗾' : dest.name === 'Bali' ? '🏝️' : dest.name === 'New York City' ? '🗽' : dest.name === 'Dubai' ? '🏙️' : dest.name === 'Rome' ? '🏛️' : dest.name === 'Bangkok' ? '🛕' : dest.name === 'London' ? '🎡' : dest.name === 'Sydney' ? '🏄' : dest.name === 'Barcelona' ? '🏛️' : dest.name === 'Santorini' ? '🏛️' : dest.name === 'Machu Picchu' ? '🏔️' : dest.name === 'Maldives' ? '🏝️' : dest.name === 'Swiss Alps' ? '🏔️' : dest.name === 'Kyoto' ? '⛩️' : dest.name === 'Cape Town' ? '🌊' : dest.name === 'Amalfi Coast' ? '🏖️' : dest.name === 'Banff National Park' ? '🏔️' : dest.name === 'Queenstown' ? '⛰️' : dest.name === 'Reykjavik & Golden Circle' ? '🌋' : '📍'}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dest.name}</h3>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{dest.country}</p>
                      </div>
                      <div className="flex gap-1">
                        {dest.isPopular && <span className="badge-primary text-xs">Popular</span>}
                        {dest.isPremium && (
                          <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-medium">
                            <FiCrown className="w-3 h-3" /> Premium
                          </span>
                        )}
                        {wishlistIds.has(dest._id) && <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full"><FiHeart className="w-3 h-3" /></span>}
                      </div>
                    </div>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-3 line-clamp-2">{dest.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span>💰 {dest.estimatedBudget?.currency} {dest.estimatedBudget?.min} - {dest.estimatedBudget?.max}</span>
                      <span>⭐ {(dest.attractions?.reduce((s, a) => s + a.rating, 0) / (dest.attractions?.length || 1)).toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2">No Destinations Found</h3>
          <p className="text-dark-500 dark:text-dark-400">Try a different search term</p>
        </div>
      )}

      {isFreePlan && (
        <div className="card p-6 mt-8 text-center border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/10">
          <FiCrown className="w-8 h-8 mx-auto mb-3 text-violet-500" />
          <h3 className="text-lg font-bold mb-1">Unlock Premium Destinations</h3>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            Upgrade to <strong>Pro</strong> or <strong>Team</strong> to access {destinations.filter(d => d.isPremium).length || 10}+ exclusive premium destinations with detailed guides, hotels, and restaurants.
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

export default Destinations;
