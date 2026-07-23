import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiTrash2, FiClock, FiMapPin, FiDollarSign, FiX } from 'react-icons/fi';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const CATEGORIES = ['morning', 'afternoon', 'evening', 'night'];

const Itinerary = () => {
  const { id: tripId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    time: '',
    category: 'morning',
  });

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      const [tripRes, itineraryRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/itinerary`).catch(() => null),
      ]);
      setTrip(tripRes.data.data);
      setItinerary(itineraryRes?.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addDay = async () => {
    if (!trip) {
      toast.error('Trip data not loaded yet');
      return;
    }
    if (!itinerary) {
      // Create initial itinerary
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const days = [];
      let current = new Date(startDate);
      let dayNum = 1;
      while (current <= endDate) {
        days.push({
          dayNumber: dayNum,
          date: current.toISOString(),
          activities: [],
          notes: '',
        });
        current.setDate(current.getDate() + 1);
        dayNum++;
      }
      try {
        const res = await api.put(`/trips/${tripId}/itinerary`, { days });
        setItinerary(res.data.data);
        toast.success('Itinerary created');
      } catch (err) {
        toast.error('Failed to create itinerary');
      }
    } else {
      // Add a new day
      const lastDay = itinerary.days[itinerary.days.length - 1];
      const newDay = {
        dayNumber: lastDay.dayNumber + 1,
        date: new Date(new Date(lastDay.date).getTime() + 86400000).toISOString(),
        activities: [],
        notes: '',
      };
      try {
        const res = await api.put(`/trips/${tripId}/itinerary`, {
          days: [...itinerary.days, newDay],
        });
        setItinerary(res.data.data);
        toast.success('Day added');
      } catch (err) {
        toast.error('Failed to add day');
      }
    }
  };

  const openAddActivity = (dayNumber) => {
    setActiveDay(dayNumber);
    setActivityForm({ title: '', time: '', category: 'morning' });
    setShowModal(true);
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) {
      toast.error('Activity title is required');
      return;
    }
    if (!activityForm.time.trim()) {
      toast.error('Please add a time');
      return;
    }
    try {
      const res = await api.post(`/trips/${tripId}/itinerary/days/${activeDay}/activities`, {
        title: activityForm.title.trim(),
        time: activityForm.time.trim(),
        category: activityForm.category,
        description: '',
        cost: 0,
      });
      setItinerary(res.data.data);
      setShowModal(false);
      setActiveDay(null);
      toast.success('Activity added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add activity');
    }
  };

  const deleteActivity = async (activityId) => {
    try {
      const res = await api.delete(`/trips/${tripId}/itinerary/activities/${activityId}`);
      setItinerary(res.data.data);
      toast.success('Activity deleted');
    } catch (err) {
      toast.error('Failed to delete activity');
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 w-full rounded-2xl" />)}</div>;
  }

  return (
    <div>
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Itinerary</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Day-by-day trip plan</p>
        </div>
        <button onClick={addDay} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> {itinerary ? 'Add Day' : 'Create Itinerary'}
        </button>
      </div>

      {itinerary?.days?.length > 0 ? (
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <motion.div key={day.dayNumber} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Day {day.dayNumber}</h3>
                    <p className="text-white/80 text-sm">{formatDate(day.date)}</p>
                  </div>
                  <button onClick={() => openAddActivity(day.dayNumber)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {day.activities?.length > 0 ? (
                  <div className="space-y-3">
                    {['morning', 'afternoon', 'evening', 'night'].map((period) => {
                      const periodActivities = day.activities.filter(a => a.category === period);
                      if (periodActivities.length === 0) return null;
                      return (
                        <div key={period}>
                          <h4 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase mb-2">{period}</h4>
                          {periodActivities.map((activity) => (
                            <div key={activity._id} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-700 mb-2 group">
                              <div className="w-16 text-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary-500">{activity.time}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{activity.title}</p>
                                {activity.description && <p className="text-xs text-dark-500 mt-1">{activity.description}</p>}
                                <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                                  {activity.cost > 0 && <span className="flex items-center gap-1"><FiDollarSign className="w-3 h-3" />${activity.cost}</span>}
                                  {activity.location?.name && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{activity.location.name}</span>}
                                </div>
                              </div>
                              <button onClick={() => deleteActivity(activity._id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-dark-500 mb-3">No activities planned for this day</p>
                    <button onClick={() => openAddActivity(day.dayNumber)} className="btn-secondary text-sm">Add Activity</button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2">No Itinerary Yet</h3>
          <p className="text-dark-500 dark:text-dark-400 mb-6">Start building your day-by-day trip plan</p>
          <button onClick={addDay} className="btn-primary">Create Itinerary</button>
        </div>
      )}

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold">Add Activity — Day {activeDay}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleActivitySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Activity Title *</label>
                  <input
                    type="text"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="Eiffel Tower visit"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Time *</label>
                    <input
                      type="time"
                      value={activityForm.time}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, time: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={activityForm.category}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">Add Activity</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Itinerary;
