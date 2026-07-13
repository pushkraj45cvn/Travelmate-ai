import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiTrash2, FiHeart, FiLock, FiStar, FiMapPin, FiAward } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';

const emojiMap = {
  'Paris': '🗼', 'Tokyo': '🗾', 'Bali': '🏝️', 'New York City': '🗽', 'Dubai': '🏙️',
};

const Wishlist = () => {
  const { user } = useSelector((state) => state.auth);
  const [wishlist, setWishlist] = useState({ destinations: [] });
  const [loading, setLoading] = useState(true);

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/destinations/wishlist/me');
      setWishlist(res.data.data || { destinations: [] });
    } catch (err) {} finally { setLoading(false); }
  };

  const removeFromWishlist = async (destId) => {
    try {
      await api.delete(`/destinations/wishlist/${destId}`);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (err) { toast.error('Failed to remove'); }
  };

  const destinations = wishlist?.destinations?.filter(d => d.destination) || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
      <p className="text-dark-500 dark:text-dark-400 mb-8">Destinations you want to visit</p>

      {isFreePlan ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Wishlist is Pro Feature</h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-6">
            Save and organize your dream destinations. Upgrade to <strong>Pro</strong> or <strong>Team</strong> to unlock your personal wishlist.
          </p>
          <Link
            to="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold hover:opacity-90 transition-all"
          >
            <FiStar className="w-4 h-4" />
            View Plans
          </Link>
        </div>
      ) : loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((item, idx) => {
            const dest = item.destination;
            if (!dest) return null;
            const isCity = dest._type === 'City' || item.itemType === 'City';
            const detailPath = isCity ? `/destinations/city/${dest.slug || dest._id}` : `/destinations/${dest._id}`;
            const countryName = isCity ? (dest.countryName || (dest.country?.name) || '') : dest.country;
            const emoji = emojiMap[dest.name] || (isCity ? '📍' : '📍');

            return (
              <motion.div key={dest._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card overflow-hidden group">
                <Link to={detailPath}>
                  <div className={`h-32 bg-gradient-to-br ${dest.isPremium ? 'from-violet-500 to-purple-600' : 'from-primary-400 to-accent-500'} flex items-center justify-center text-4xl`}>
                    {emoji}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <Link to={detailPath} className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{dest.name}</h3>
                      <p className="text-xs text-dark-500 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 shrink-0" /> {countryName || 'Unknown'}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {dest.isPremium && (
                        <span className="text-[10px] bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                          <FiAward className="w-2.5 h-2.5 inline" />
                        </span>
                      )}
                      {isCity && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">City</span>
                      )}
                    </div>
                  </div>
                  {item.notes && <p className="text-xs text-dark-400 mt-2 italic">"{item.notes}"</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                    <button onClick={() => removeFromWishlist(dest._id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FiHeart}
          title="Your wishlist is empty"
          description="Start exploring and add cities you'd love to visit!"
          action={{ label: 'Explore Destinations', to: '/destinations' }}
        />
      )}
    </div>
  );
};

export default Wishlist;
