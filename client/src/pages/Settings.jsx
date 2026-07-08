import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { logout } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

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
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

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
      </motion.div>
    </div>
  );
};

export default Settings;
