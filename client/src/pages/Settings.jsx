import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiTrash2, FiStar, FiCheck } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { logout } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'from-gray-400 to-gray-500',
    features: ['Basic trip planning', 'Personal itineraries', 'Expense tracking'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: '/month',
    color: 'from-primary-500 to-accent-500',
    popular: true,
    features: ['Everything in Free', 'Destination guides & wishlists', 'Trip invitations & collaboration', 'AI travel assistant', 'Priority support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$19',
    period: '/month',
    color: 'from-accent-500 to-pink-500',
    features: ['Everything in Pro', 'Unlimited collaborators', 'Team dashboards', 'Admin controls', 'Advanced analytics'],
  },
];

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeTab = searchParams.get('tab') || 'general';
  const currentPlan = user?.plan || 'free';

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updatePassword(passwordData);
      toast.success('Password updated!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    if (!window.confirm('All your data will be permanently deleted. Continue?')) return;
    try {
      await userService.deleteAccount();
      dispatch(logout());
      navigate('/');
      toast.success('Account deleted');
    } catch (err) { toast.error('Failed to delete account'); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-dark-200 dark:border-dark-700 pb-2">
          <button
            onClick={() => navigate('/settings?tab=general')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-dark-500 hover:text-dark-900 dark:hover:text-dark-100'}`}
          >
            General
          </button>
          <button
            onClick={() => navigate('/settings?tab=plan')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'plan' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-dark-500 hover:text-dark-900 dark:hover:text-dark-100'}`}
          >
            Plan & Billing
          </button>
        </div>

        {activeTab === 'plan' ? (
          /* === Plan & Billing Tab === */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-dark-500 dark:text-dark-400">Unlock more features as you grow</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`card p-6 relative ${isCurrent ? 'ring-2 ring-primary-500' : ''} ${plan.popular ? 'scale-105 md:scale-105' : ''}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg">
                        Most Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Current
                      </span>
                    )}

                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <FiStar className="w-5 h-5 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-black">{plan.price}</span>
                      <span className="text-sm text-dark-400">{plan.period}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-300">
                          <FiCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {!isCurrent && (
                      <button
                        onClick={() => toast.info('Payment integration coming soon!')}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all`}
                      >
                        {plan.id === 'free' ? 'Downgrade' : `Subscribe to ${plan.name}`}
                      </button>
                    )}
                    {isCurrent && plan.id === 'free' && (
                      <p className="text-center text-xs text-dark-400">Free plan — upgrade anytime</p>
                    )}
                    {isCurrent && plan.id !== 'free' && (
                      <p className="text-center text-xs text-green-600 dark:text-green-400">Active plan</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* === General Tab === */
          <>

        {/* Appearance */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-dark-500">Toggle dark/light theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-primary-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field pr-11" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">
                  {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field pr-11" minLength={6} required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">
                  {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiLock className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-2 border-red-200 dark:border-red-900/50">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
          <p className="text-sm text-dark-500 mb-6">Permanently delete your account and all associated data.</p>
          <button onClick={handleDeleteAccount} className="btn-danger flex items-center gap-2">
            <FiTrash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
        </>
      )}
      </motion.div>
    </div>
  );
};

export default Settings;
