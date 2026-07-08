import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiHeart } from 'react-icons/fi';
import api from '../services/api';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const params = search ? `?search=${search}` : '';
        const res = await api.get(`/destinations${params}`);
        setDestinations(res.data.data || []);
      } catch (err) {} finally { setLoading(false); }
    };
    fetchDestinations();
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
              <Link to={`/destinations/${dest._id}`} className="card overflow-hidden group block">
                <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-6xl">
                  {dest.name === 'Paris' ? '🗼' : dest.name === 'Tokyo' ? '🗾' : dest.name === 'Bali' ? '🏝️' : dest.name === 'New York City' ? '🗽' : dest.name === 'Dubai' ? '🏙️' : '📍'}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{dest.name}</h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400">{dest.country}</p>
                    </div>
                    {dest.isPopular && <span className="badge-primary text-xs">Popular</span>}
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-3 line-clamp-2">{dest.description}</p>
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span>💰 {dest.estimatedBudget?.currency} {dest.estimatedBudget?.min} - {dest.estimatedBudget?.max}</span>
                    <span>⭐ {(dest.attractions?.reduce((s, a) => s + a.rating, 0) / (dest.attractions?.length || 1)).toFixed(1)}</span>
                  </div>
                </div>
              </Link>
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
    </div>
  );
};

export default Destinations;
