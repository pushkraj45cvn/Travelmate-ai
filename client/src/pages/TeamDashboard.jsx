import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCheck, FiX, FiClock, FiSend, FiMail } from 'react-icons/fi';
import api from '../services/api';

const TeamDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes] = await Promise.allSettled([
          api.get('/invitations?sent=true'),
        ]);
        if (invRes.status === 'fulfilled') {
          setInvitations(invRes.value.data.data || []);
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statusIcon = (status) => {
    switch (status) {
      case 'accepted': return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'declined': return <FiX className="w-4 h-4 text-red-500" />;
      case 'expired': return <FiClock className="w-4 h-4 text-orange-500" />;
      default: return <FiClock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      declined: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      expired: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Dashboard</h1>
        <p className="text-dark-500 dark:text-dark-400">Manage your team invitations and members</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FiSend className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sent Invitations</h2>
            <p className="text-sm text-dark-500">Track who has accepted your trip invitations</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.map((inv, idx) => (
              <motion.div key={inv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(inv.invitedEmail || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{inv.invitedEmail}</p>
                    <div className="flex items-center gap-3 text-xs text-dark-400 mt-0.5">
                      <span>📍 {inv.trip?.destination || 'Trip'}</span>
                      <span>👤 Role: {inv.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(inv.status)}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
              <FiMail className="w-6 h-6 text-dark-400" />
            </div>
            <h3 className="font-semibold mb-1">No Invitations Sent</h3>
            <p className="text-sm text-dark-400">Invite team members to your trips to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;
