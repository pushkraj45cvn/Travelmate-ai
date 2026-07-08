import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiMoreVertical, FiEdit2, FiTrash2, FiCopy, FiArchive } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getTrips, deleteTrip } from '../redux/slices/tripSlice';
import tripService from '../services/tripService';
import Card from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { formatDate, getDaysBetween, getTripStatusColor, getTravelTypeColor } from '../utils/formatters';
import { toast } from 'react-toastify';

const Trips = () => {
  const dispatch = useDispatch();
  const { trips, isLoading, total, pages } = useSelector((state) => state.trips);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    dispatch(getTrips({ page, search, status: statusFilter }));
  }, [dispatch, page, search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await dispatch(deleteTrip(id));
      toast.success('Trip deleted');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await tripService.duplicateTrip(id);
      toast.success('Trip duplicated');
      dispatch(getTrips({ page, search, status: statusFilter }));
    } catch (err) {
      toast.error('Failed to duplicate trip');
    }
  };

  const handleArchive = async (id) => {
    try {
      await tripService.archiveTrip(id);
      toast.success('Trip archived');
      dispatch(getTrips({ page, search, status: statusFilter }));
    } catch (err) {
      toast.error('Failed to archive trip');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{total || 0} trips planned</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> New Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Trip Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon="✈️"
          title="No trips yet"
          description="Start planning your next adventure"
          actionLabel="Create Trip"
          actionLink="/trips/new"
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, idx) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card overflow-hidden group relative"
              >
                {/* Cover Image */}
                <Link to={`/trips/${trip._id}`}>
                  <div className="h-40 bg-gradient-to-br from-primary-500 to-accent-500 relative overflow-hidden">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                        ✈️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg truncate">{trip.title}</h3>
                      <p className="text-white/80 text-sm">{trip.destination}, {trip.country}</p>
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={getTripStatusColor(trip.status)}>{trip.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTravelTypeColor(trip.travelType)}`}>
                      {trip.travelType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-dark-500 dark:text-dark-400">
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    <span>{getDaysBetween(trip.startDate, trip.endDate)} days</span>
                  </div>

                  {trip.budget > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-dark-500 dark:text-dark-400">Budget: </span>
                      <span className="font-semibold">${trip.budget.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setOpenMenu(openMenu === trip._id ? null : trip._id)}
                      className="p-2 bg-black/30 hover:bg-black/50 rounded-lg text-white transition-colors"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === trip._id && (
                      <div className="absolute right-0 top-10 w-48 glass-card p-2 shadow-xl z-10 animate-scale-in">
                        <Link to={`/trips/${trip._id}/edit`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 text-sm w-full">
                          <FiEdit2 className="w-4 h-4" /> Edit
                        </Link>
                        <button onClick={() => handleDuplicate(trip._id)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 text-sm w-full">
                          <FiCopy className="w-4 h-4" /> Duplicate
                        </button>
                        <button onClick={() => handleArchive(trip._id)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 text-sm w-full">
                          <FiArchive className="w-4 h-4" /> Archive
                        </button>
                        <hr className="my-1 border-gray-100 dark:border-dark-700" />
                        <button onClick={() => handleDelete(trip._id)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 w-full">
                          <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Trips;
