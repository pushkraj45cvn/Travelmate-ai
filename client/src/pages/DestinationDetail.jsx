import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiMapPin, FiStar } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/destinations/${id}`);
        setDestination(res.data.data);
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const addToWishlist = async () => {
    try {
      await api.post('/destinations/wishlist', { destinationId: id });
      toast.success('Added to wishlist!');
    } catch (err) { toast.error(err.response?.data?.error || 'Already in wishlist'); }
  };

  if (loading || !destination) {
    return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>;
  }

  return (
    <div>
      <Link to="/destinations" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Destinations
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-8xl relative mb-8">
          {destination.name === 'Paris' ? '🗼' : destination.name === 'Tokyo' ? '🗾' : destination.name === 'Bali' ? '🏝️' : destination.name === 'New York City' ? '🗽' : destination.name === 'Dubai' ? '🏙️' : '📍'}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">{destination.name}</h1>
                <p className="text-white/80 flex items-center gap-2"><FiMapPin className="w-4 h-4" /> {destination.country}</p>
              </div>
              <button onClick={addToWishlist} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors">
                <FiHeart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-dark-600 dark:text-dark-400">{destination.description}</p>
            </div>

            {/* Attractions */}
            {destination.attractions?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Top Attractions</h2>
                <div className="space-y-3">
                  {destination.attractions.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">📍</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attr.name}</p>
                        <p className="text-xs text-dark-500">{attr.description}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm"><FiStar className="w-4 h-4 text-yellow-500" />{attr.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {destination.hotels?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Hotels</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {destination.hotels.map((hotel, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
                      <p className="font-medium text-sm">{hotel.name}</p>
                      <p className="text-xs text-dark-500">{hotel.type} · ${hotel.pricePerNight}/night</p>
                      <span className="flex items-center gap-1 text-xs mt-1"><FiStar className="w-3 h-3 text-yellow-500" />{hotel.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-dark-500">Best Time</span><span className="font-medium">{destination.bestTimeToVisit}</span></div>
                <div className="flex justify-between"><span className="text-dark-500">Currency</span><span className="font-medium">{destination.currency}</span></div>
                <div className="flex justify-between"><span className="text-dark-500">Language</span><span className="font-medium">{destination.language}</span></div>
                <div className="flex justify-between"><span className="text-dark-500">Timezone</span><span className="font-medium">{destination.timezone}</span></div>
                <div className="flex justify-between"><span className="text-dark-500">Budget</span><span className="font-medium">${destination.estimatedBudget?.min} - ${destination.estimatedBudget?.max}</span></div>
              </div>
              <button onClick={addToWishlist} className="btn-outline w-full mt-4 text-sm">Add to Wishlist</button>
            </div>

            {/* Travel Tips */}
            {destination.travelTips?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Travel Tips</h3>
                <ul className="space-y-2">
                  {destination.travelTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-dark-600 dark:text-dark-400 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Restaurants */}
            {destination.restaurants?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Restaurants</h3>
                <div className="space-y-2">
                  {destination.restaurants.map((rest, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700">
                      <span className="font-medium">{rest.name}</span>
                      <span className="text-dark-400">{rest.priceRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DestinationDetail;
