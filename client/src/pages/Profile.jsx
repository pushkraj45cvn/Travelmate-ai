import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiCamera, FiSave, FiMapPin, FiGlobe } from 'react-icons/fi';
import api from '../services/api';
import userService from '../services/userService';
import { setUser } from '../redux/slices/authSlice';
import { CURRENCIES } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '', bio: '', country: '', preferredCurrency: 'USD', preferredLanguage: 'en',
  });
  const [travelHistory, setTravelHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        country: user.country || '',
        preferredCurrency: user.preferredCurrency || 'USD',
        preferredLanguage: user.preferredLanguage || 'en',
      });
      fetchTravelHistory();
    }
  }, [user]);

  const fetchTravelHistory = async () => {
    try {
      const res = await userService.getTravelHistory();
      setTravelHistory(res.data || []);
    } catch (err) {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile(formData);
      dispatch(setUser({ ...user, ...updated }));
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const updated = await userService.updateAvatar(fd);
      dispatch(setUser({ ...user, avatar: updated.avatar }));
      toast.success('Avatar updated!');
    } catch (err) { toast.error('Upload failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        {/* Avatar */}
        <div className="card p-8 text-center mb-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl text-white mx-auto overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-primary-600 transition-colors">
              <FiCamera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <h2 className="text-xl font-bold mt-4">{user?.name}</h2>
          <p className="text-dark-500 dark:text-dark-400 text-sm">{user?.email}</p>
          <p className="text-xs text-dark-400 mt-1">Member since {formatDate(user?.createdAt)}</p>
        </div>

        {/* Edit Form */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Edit Profile</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="input-field" placeholder="Tell the world about yourself..." />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2"><FiMapPin className="w-3 h-3 inline" /> Country</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2"><FiGlobe className="w-3 h-3 inline" /> Currency</label>
                <select value={formData.preferredCurrency} onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })} className="input-field">
                  {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select value={formData.preferredLanguage} onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })} className="input-field">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Travel History */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Travel History</h2>
          {travelHistory.length > 0 ? (
            <div className="space-y-3">
              {travelHistory.map((trip) => (
                <div key={trip._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg">✈️</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{trip.title}</p>
                    <p className="text-xs text-dark-500">{trip.destination}, {trip.country} · {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                  </div>
                  <span className="badge-success text-xs">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-center py-6">No completed trips yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
