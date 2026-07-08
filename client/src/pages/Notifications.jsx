import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { getRelativeTime } from '../utils/formatters';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {}
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllAsRead} className="btn-secondary text-sm flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif, idx) => (
            <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
              className={`card p-4 flex items-start gap-4 ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-900/30' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${!notif.isRead ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-dark-700'}`}>
                {notif.type === 'invitation_received' ? '📨' : notif.type === 'expense_added' ? '💰' : notif.type === 'trip_updated' ? '🔄' : notif.type === 'new_message' ? '💬' : notif.type === 'member_joined' ? '👋' : '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{notif.message}</p>
                  </div>
                  <span className="text-xs text-dark-400 flex-shrink-0 ml-2">{getRelativeTime(notif.createdAt)}</span>
                </div>
                {notif.actionUrl && (
                  <Link to={notif.actionUrl} className="text-xs text-primary-500 hover:text-primary-600 mt-2 inline-block">View details</Link>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!notif.isRead && (
                  <button onClick={() => markAsRead(notif._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-400">
                    <FiCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNotification(notif._id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      )}
    </div>
  );
};

export default Notifications;
