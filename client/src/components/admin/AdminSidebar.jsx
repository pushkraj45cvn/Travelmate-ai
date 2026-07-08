import { Link, useLocation } from 'react-router-dom';
import { FiX, FiBarChart2, FiUsers, FiMap, FiShield } from 'react-icons/fi';
import { BsSuitcase2 } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiBarChart2, end: true },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/trips', label: 'Trips', icon: BsSuitcase2 },
  { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-lg shadow-lg">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-dark-500">TravelMate AI</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path, item.end);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-red-500' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-dark-700">
        <Link to="/dashboard" className="text-sm text-dark-500 hover:text-primary-500 block text-center">
          Back to App
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 z-50">
        {content}
      </aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-800 z-50 lg:hidden shadow-2xl">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
