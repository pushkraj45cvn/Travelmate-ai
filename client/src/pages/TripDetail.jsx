import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiArrowLeft, FiMoreVertical } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { getTrip, deleteTrip } from '../redux/slices/tripSlice';
import { formatDate, getDaysBetween, getTripStatusColor, getTravelTypeColor, formatCurrency } from '../utils/formatters';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import expenseService from '../services/expenseService';
import packingService from '../services/packingService';

ChartJS.register(ArcElement, Tooltip, Legend);

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrip: trip, isLoading } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [packingProgress, setPackingProgress] = useState(0);

  useEffect(() => {
    dispatch(getTrip(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (trip) {
      fetchExpenseSummary();
      fetchPackingProgress();
    }
  }, [trip]);

  const fetchExpenseSummary = async () => {
    try {
      const summary = await expenseService.getExpenseSummary(trip._id);
      setExpenseSummary(summary);
    } catch (err) {}
  };

  const fetchPackingProgress = async () => {
    try {
      const list = await packingService.getPackingList(trip._id);
      const total = list.items?.length || 0;
      const checked = list.items?.filter(i => i.isChecked).length || 0;
      setPackingProgress(total > 0 ? Math.round((checked / total) * 100) : 0);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this trip permanently?')) {
      await dispatch(deleteTrip(id));
      toast.success('Trip deleted');
      navigate('/trips');
    }
  };

  if (isLoading || !trip) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-64 w-full rounded-2xl" />
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-96" />
      </div>
    );
  }

  const isOwner = trip.owner?._id === user?.id || trip.owner === user?.id;
  const expenseData = {
    labels: expenseSummary?.byCategory?.map(c => c._id) || [],
    datasets: [{
      data: expenseSummary?.byCategory?.map(c => c.total) || [],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f97316'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      {/* Back button */}
      <Link to="/trips" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trips
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary-500 to-accent-500">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl opacity-30">✈️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={getTripStatusColor(trip.status)}>{trip.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white bg-white/20`}>{trip.travelType}</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{trip.title}</h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <FiMapPin className="w-4 h-4" /> {trip.destination}, {trip.country}
              </p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link to={`/trips/${id}/edit`} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors">
                  <FiEdit2 className="w-5 h-5" />
                </Link>
                <button onClick={handleDelete} className="p-3 bg-red-500/60 hover:bg-red-500/80 rounded-xl text-white transition-colors">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiCalendar, label: 'Duration', value: `${getDaysBetween(trip.startDate, trip.endDate)} days` },
          { icon: FiCalendar, label: 'Dates', value: `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` },
          { icon: FiUsers, label: 'Travelers', value: `${trip.numberOfTravelers}` },
          { icon: FiDollarSign, label: 'Budget', value: formatCurrency(trip.budget, trip.currency) },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Description */}
      {trip.description && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">About this Trip</h2>
          <p className="text-dark-600 dark:text-dark-400">{trip.description}</p>
        </Card>
      )}

      {/* Quick Actions & Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Links */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Trip Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: `/trips/${id}/itinerary`, label: 'Itinerary', icon: '🗺️' },
              { to: `/trips/${id}/expenses`, label: 'Expenses', icon: '💰' },
              { to: `/trips/${id}/packing`, label: 'Packing', icon: '📦' },
              { to: `/trips/${id}/chat`, label: 'Chat', icon: '💬' },
              { to: `/trips/${id}/gallery`, label: 'Gallery', icon: '📸' },
              { to: `/trips/${id}/documents`, label: 'Documents', icon: '📄' },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors text-center">
                <span className="text-2xl block mb-1">{link.icon}</span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Expense Summary */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Expense Summary</h2>
          {expenseSummary ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 flex-shrink-0">
                <Doughnut data={expenseData} options={{ cutout: '65%', plugins: { legend: { display: false } } }} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Spent</span>
                  <span className="font-semibold text-red-500">{formatCurrency(expenseSummary.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Budget</span>
                  <span className="font-semibold">{formatCurrency(expenseSummary.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Remaining</span>
                  <span className={`font-semibold ${expenseSummary.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(expenseSummary.remaining)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-dark-500 text-center py-6">No expenses yet</p>
          )}
        </Card>
      </div>

      {/* Collaborators */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Collaborators</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
              {trip.owner?.name?.charAt(0) || 'O'}
            </div>
            <span className="text-sm">{trip.owner?.name || 'Owner'}</span>
            <span className="text-xs text-dark-400">(Owner)</span>
          </div>
          {trip.collaborators?.map((collab) => (
            <div key={collab.user?._id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                {collab.user?.name?.charAt(0) || '?'}
              </div>
              <span className="text-sm">{collab.user?.name}</span>
              <span className="text-xs text-dark-400">({collab.role})</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TripDetail;
