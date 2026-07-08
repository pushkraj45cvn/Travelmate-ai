import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ destinations: [] });
  const [loading, setLoading] = useState(true);

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

      {destinations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((item, idx) => {
            const dest = item.destination;
            return (
              <motion.div key={dest._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card overflow-hidden group">
                <Link to={`/destinations/${dest._id}`}>
                  <div className="h-40 bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-5xl">
                    {dest.name === 'Paris' ? '🗼' : dest.name === 'Tokyo' ? '🗾' : '📍'}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <Link to={`/destinations/${dest._id}`}>
                      <h3 className="font-semibold">{dest.name}</h3>
                      <p className="text-xs text-dark-500">{dest.country}</p>
                    </Link>
                    <button onClick={() => removeFromWishlist(dest._id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.notes && <p className="text-xs text-dark-400 mt-2">{item.notes}</p>}
                  <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {item.priority} priority
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          description="Save destinations you'd like to visit"
          actionLabel="Explore Destinations"
          actionLink="/destinations"
        />
      )}
    </div>
  );
};

export default Wishlist;
