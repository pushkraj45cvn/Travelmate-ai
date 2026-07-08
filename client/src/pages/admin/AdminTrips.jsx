import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate, getTripStatusColor } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/admin/trips');
      setTrips(res.data.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm('Delete this trip permanently?')) return;
    try {
      await api.delete(`/admin/trips/${id}`);
      toast.success('Trip deleted');
      setTrips(prev => prev.filter(t => t._id !== id));
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">All Trips</h1>
      <p className="text-dark-500 dark:text-dark-400 mb-8">{trips.length} total trips</p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-700">
                <th className="text-left p-4 text-sm font-medium text-dark-500">Trip</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Owner</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Destination</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Dates</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, idx) => (
                <motion.tr key={trip._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="border-b border-gray-50 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="p-4 font-medium text-sm">{trip.title}</td>
                  <td className="p-4 text-sm text-dark-500">{trip.owner?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm">{trip.destination}, {trip.country}</td>
                  <td className="p-4"><span className={getTripStatusColor(trip.status)}>{trip.status}</span></td>
                  <td className="p-4 text-sm text-dark-500">{formatDate(trip.startDate)}</td>
                  <td className="p-4">
                    <button onClick={() => deleteTrip(trip._id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrips;
