import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiArrowLeft, FiMoreVertical, FiSend, FiCheckSquare, FiPlus, FiStar } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { getTrip, deleteTrip } from '../redux/slices/tripSlice';
import { formatDate, getDaysBetween, getTripStatusColor, getTravelTypeColor, formatCurrency } from '../utils/formatters';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import expenseService from '../services/expenseService';
import packingService from '../services/packingService';
import api from '../services/api';
import Card from '../components/common/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUSES = ['planning', 'ongoing', 'completed', 'cancelled'];

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrip: trip, isLoading } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [packingProgress, setPackingProgress] = useState(0);
  const [packingItems, setPackingItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    dispatch(getTrip(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (trip) {
      fetchExpenseSummary();
      fetchPackingData();
      fetchMyReview();
    }
  }, [trip]);

  const fetchMyReview = async () => {
    try {
      const res = await api.get(`/trips/${id}/review`);
      if (res.data.data) {
        setMyReview(res.data.data);
        setReviewRating(res.data.data.rating);
        setReviewTitle(res.data.data.title || '');
        setReviewComment(res.data.data.comment || '');
      }
    } catch (err) {}
  };

  const fetchExpenseSummary = async () => {
    try {
      const summary = await expenseService.getExpenseSummary(trip._id);
      setExpenseSummary(summary);
    } catch (err) {}
  };

  const fetchPackingData = async () => {
    try {
      const list = await packingService.getPackingList(trip._id);
      setPackingItems(list.items || []);
      const limit = list.itemLimit || 20;
      const total = list.items?.length || 0;
      setPackingProgress(Math.min(Math.round((total / limit) * 100), 100));
    } catch (err) {}
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/trips/${id}/status`, { status: newStatus });
      dispatch(getTrip(id));
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      await packingService.toggleItem(trip._id, itemId);
      fetchPackingData();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      await packingService.addItem(trip._id, { name: newItemName });
      setNewItemName('');
      fetchPackingData();
      toast.success('Item added');
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleDeletePackingItem = async (itemId) => {
    try {
      await packingService.deleteItem(trip._id, itemId);
      fetchPackingData();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post(`/trips/${id}/review`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      fetchMyReview();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this trip permanently?')) {
      await dispatch(deleteTrip(id));
      toast.success('Trip deleted');
      navigate('/trips');
    }
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const { default: api } = await import('../services/api');
      await api.post(`/trips/${id}/invitations`, { email: inviteEmail, role: inviteRole });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
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

  const userId = user?.id || user?._id;
  const isOwner = trip.owner?._id === userId || trip.owner === userId;
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
                {isOwner ? (
                  <select
                    value={trip.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs px-2 py-1 rounded-full bg-white/20 text-white border-0 cursor-pointer appearance-none outline-none font-medium"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="text-dark-800 bg-white">{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={getTripStatusColor(trip.status)}>{trip.status}</span>
                )}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Expense Summary</h2>
            <Link to={`/trips/${id}/expenses`} className="text-sm text-primary-500 hover:text-primary-600">Manage All</Link>
          </div>
          {expenseSummary ? (
            <>
              <div className="flex items-center gap-6 mb-4">
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
              {/* Recent Expenses List */}
              {expenseSummary.recent?.length > 0 && (
                <div className="border-t border-gray-100 dark:border-dark-700 pt-4">
                  <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-3">Recent Expenses</p>
                  <div className="space-y-2">
                    {expenseSummary.recent.map((exp) => (
                      <div key={exp._id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                          <div>
                            <p className="text-sm font-medium">{exp.title || exp.category}</p>
                            <p className="text-xs text-dark-400">{exp.category} · {formatDate(exp.date)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-500">-{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-dark-500 text-center py-6">No expenses yet</p>
          )}
        </Card>
      </div>

      {/* Packing Checklist */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FiCheckSquare className="w-5 h-5" /> Packing Checklist</h2>
          <Link to={`/trips/${id}/packing`} className="text-sm text-primary-500 hover:text-primary-600">Manage All</Link>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-500">Items</span>
            <span className="font-medium">{packingItems.length}/20 · {packingProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
            <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${packingProgress}%` }} />
          </div>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto mb-3">
          {packingItems.length === 0 ? (
            <p className="text-sm text-dark-400 text-center py-4">No packing items yet. Add one below.</p>
          ) : (
            packingItems.slice(0, 10).map((item) => (
              <div key={item._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 group">
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isChecked || false}
                    onChange={() => handleToggleItem(item._id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                  <span className={`text-sm ${item.isChecked ? 'line-through text-dark-400' : ''}`}>{item.name}</span>
                </label>
                <button onClick={() => handleDeletePackingItem(item._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs p-1 transition-opacity">✕</button>
              </div>
            ))
          )}
          {packingItems.length > 10 && (
            <p className="text-xs text-center text-dark-400 pt-1">+{packingItems.length - 10} more items</p>
          )}
        </div>

        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add item..."
            className="input-field flex-1 text-sm py-2"
          />
          <button type="submit" className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
            <FiPlus className="w-4 h-4" /> Add
          </button>
        </form>
      </Card>

      {/* Collaborators */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collaborators</h2>
          {isOwner && (
            <span className="text-xs text-dark-400">You are the owner</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
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

        {isOwner && (user?.plan === 'pro' || user?.plan === 'team') && (
          <form onSubmit={sendInvitation} className="flex items-end gap-3 pt-3 border-t border-gray-200 dark:border-dark-700">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-dark-500">Invite by email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="input-field text-sm"
                required
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium mb-1 text-dark-500">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-field text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sendingInvite}
              className="btn-primary text-sm flex items-center gap-2 !py-[10px]"
            >
              <FiSend className="w-4 h-4" />
              {sendingInvite ? 'Sending...' : 'Invite'}
            </button>
          </form>
        )}
      </Card>

      {/* Review Section */}
      {trip.status === 'completed' && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiStar className="w-5 h-5 text-yellow-400" /> Rate This Trip
          </h2>

          {myReview ? (
            <div className="space-y-3">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <FiStar key={i} className={`w-5 h-5 ${i < myReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-dark-300'}`} />
                ))}
              </div>
              {myReview.title && <p className="font-semibold text-sm">{myReview.title}</p>}
              <p className="text-dark-600 dark:text-dark-400 text-sm italic">"{myReview.comment}"</p>
              <p className="text-xs text-green-600 font-medium">✓ You reviewed this trip</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-colors"
                    >
                      <FiStar className={`w-7 h-7 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-dark-300 hover:text-yellow-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="input-field text-sm"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your trip experience..."
                  className="input-field text-sm min-h-[100px]"
                  maxLength={2000}
                  required
                />
              </div>
              <button type="submit" disabled={reviewLoading} className="btn-primary">
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
};

export default TripDetail;
