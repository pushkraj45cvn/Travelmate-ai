import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLock, FiStar } from 'react-icons/fi';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';

const Invitations = () => {
  const { user } = useSelector((state) => state.auth);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFreePlan = user && user.plan === 'free';

  useEffect(() => { fetchInvitations(); }, []);

  const fetchInvitations = async () => {
    try {
      const res = await api.get('/invitations');
      setInvitations(res.data.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const respond = async (token, status) => {
    try {
      await api.put(`/invitations/${token}`, { status });
      toast.success(status === 'accepted' ? 'Invitation accepted!' : 'Invitation declined');
      fetchInvitations();
    } catch (err) { toast.error('Failed to respond'); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Invitations</h1>
      <p className="text-dark-500 dark:text-dark-400 mb-8">Trip invitations from friends</p>

      {invitations.length > 0 ? (
        <div className="space-y-4">
          {invitations.map((inv, idx) => (
            <motion.div key={inv._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center text-2xl">📨</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{inv.trip?.title || 'Trip Invitation'}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {inv.invitedBy?.name} invited you to <strong>{inv.trip?.destination}</strong>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                    <span>📍 {inv.trip?.destination}, {inv.trip?.country}</span>
                    <span>📅 {inv.trip?.startDate && formatDate(inv.trip.startDate)}</span>
                    <span>👤 Role: {inv.role}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={() => respond(inv.token, 'accepted')} className="btn-primary text-sm flex items-center gap-2 !py-2">
                      <FiCheck className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => respond(inv.token, 'declined')} className="btn-secondary text-sm flex items-center gap-2 !py-2">
                      <FiX className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : isFreePlan ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Subscribe to Connect</h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-6">
            Trip invitations and group collaboration are available on <strong>Pro</strong> and <strong>Team</strong> plans. Upgrade to travel together.
          </p>
          <Link
            to="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold hover:opacity-90 transition-all"
          >
            <FiStar className="w-4 h-4" />
            View Plans
          </Link>
        </div>
      ) : (
        <EmptyState icon="📨" title="No pending invitations" description="When someone invites you to a trip, it will appear here" />
      )}
    </div>
  );
};

export default Invitations;
