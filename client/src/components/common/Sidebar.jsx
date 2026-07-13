import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { FiX, FiHome, FiMap, FiCompass, FiHeart, FiUsers, FiBell, FiMail, FiMenu, FiLock, FiCircle, FiKey, FiLink, FiCpu, FiGlobe } from 'react-icons/fi';
import { MdOutlineFlight, MdOutlineDashboard, MdOutlineInventory2 } from 'react-icons/md';
import { BsSuitcase2, BsCalendarCheck, BsImage } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const PremiumNavItem = ({ item, active, onClose }) => {
  const Icon = item.icon;
  return (
    <div className="relative group">
      <Link
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
        <FiLock className="w-3 h-3 text-amber-500 ml-auto" />
      </Link>
      <div className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-full">
        PRO
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const userPlan = user?.plan || 'free';
  const isPremium = userPlan === 'pro' || userPlan === 'team';
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (userPlan === 'team') {
      api.get('/users/team-members')
        .then(res => setTeamMembers(res.data.data || []))
        .catch(() => {});
    }
  }, [userPlan]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdOutlineDashboard },
    { path: '/explore', label: 'Explore', icon: FiGlobe },
    { path: '/trips', label: 'My Trips', icon: BsSuitcase2 },
    { path: '/trips/new', label: 'New Trip', icon: MdOutlineFlight },
    { path: '/destinations', label: 'Destinations', icon: FiCompass, premium: true },
    { path: '/wishlist', label: 'Wishlist', icon: FiHeart, premium: true },
    { path: '/invitations', label: 'Invitations', icon: FiMail, premium: true },
    ...(userPlan === 'team' ? [
      { path: '/team', label: 'Team Dashboard', icon: FiUsers },
    ] : []),
  ];

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
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary-500/25">
            ✈️
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">TravelMate</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-dark-500 dark:text-dark-400">AI Travel Planner</p>
              {user?.plan && user.plan !== 'free' && (
                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-full ${user.plan === 'pro' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'}`}>
                  {user.plan === 'pro' ? 'PRO' : 'TEAM'}
                </span>
              )}
            </div>
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

          if (item.premium && !isPremium) {
            return <PremiumNavItem key={item.path} item={item} active={active} onClose={onClose} />;
          }

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

      {/* Team Members */}
      {userPlan === 'team' && teamMembers.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700">
          <p className="text-[10px] uppercase tracking-wider text-dark-400 font-medium mb-2 px-2">
            Team Members ({teamMembers.length}/4)
          </p>
          <div className="space-y-1">
            {teamMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${member.teamRole === 'owner' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-primary-400 to-accent-400'}`}>
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark-700 dark:text-dark-300 truncate">
                    {member.name}
                    {member.teamRole === 'owner' && <span className="text-[10px] text-violet-500 ml-1 font-semibold">Owner</span>}
                  </p>
                  <p className="text-[10px] text-dark-400 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
