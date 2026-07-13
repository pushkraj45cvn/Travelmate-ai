import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiBell, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

const Navbar = ({ onMenuClick, isAdmin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-40 glass border-b border-gray-200/50 dark:border-dark-700/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-dark-500 dark:text-dark-400">
              Welcome back,
            </span>
            <span className="text-sm font-semibold gradient-text">{user?.name}</span>
            {user?.plan && user.plan !== 'free' && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${user.plan === 'pro' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'}`}>
                {user.plan === 'pro' ? 'PRO' : 'TEAM'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            {isDarkMode ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-dark-500" />
            )}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <FiBell className="w-5 h-5" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-xl animate-scale-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-700 mb-1">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-sm"
                >
                  <FiUser className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-sm"
                >
                  <FiSettings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-100 dark:border-dark-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 w-full"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
