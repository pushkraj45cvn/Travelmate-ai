import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${page}&limit=10`);
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {} finally { setLoading(false); }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await api.put(`/users/${userId}/suspend`);
      } else {
        await api.put(`/users/${userId}/activate`);
      }
      toast.success(`User ${isActive ? 'suspended' : 'activated'}`);
      fetchUsers();
    } catch (err) { toast.error('Failed to update user'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{total} total users</p>
        </div>
        <div className="relative w-64">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search users..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-700">
                <th className="text-left p-4 text-sm font-medium text-dark-500">User</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-dark-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="border-b border-gray-50 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-dark-500">{user.email}</td>
                  <td className="p-4"><span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge'}`}>{user.role}</span></td>
                  <td className="p-4"><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="p-4 text-sm text-dark-500">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <button onClick={() => toggleUserStatus(user._id, user.isActive)} className={`p-2 rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500' : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-500'}`}>
                      {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
