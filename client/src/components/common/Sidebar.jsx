import { Link, useLocation } from 'react-router-dom';
import { FiX, FiHome, FiMap, FiCompass, FiHeart, FiUsers, FiBell, FiMail, FiMenu } from 'react-icons/fi';
import { MdOutlineFlight, MdOutlineDashboard, MdOutlineInventory2 } from 'react-icons/md';
import { BsSuitcase2, BsCalendarCheck, BsImage } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: MdOutlineDashboard },
  { path: '/trips', label: 'My Trips', icon: BsSuitcase2 },
  { path: '/trips/new', label: 'New Trip', icon: MdOutlineFlight },
  { path: '/destinations', label: 'Destinations', icon: FiCompass },
  { path: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { path: '/invitations', label: 'Invitations', icon: FiMail },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/trips' && location.pathname.startsWith('/trips') && location.pathname !== '/trips/new') {
      return true;
    }
    return location.pathname === path;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary-500/25">
            ✈️
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">TravelMate</h1>
            <p className="text-xs text-dark-500 dark:text-dark-400">AI Travel Planner</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-dark-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary-500' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-700">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-dark-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
        >
          <FiUsers className="w-5 h-5" />
          Profile & Settings
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-800 z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
