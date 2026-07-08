import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';

const AuthLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full" />
        </div>
        <div className="relative flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl">
                ✈️
              </div>
              <span className="text-2xl font-bold">TravelMate AI</span>
            </Link>
            <h2 className="text-4xl font-bold mb-4">Your Journey Begins Here</h2>
            <p className="text-lg text-white/80 max-w-md">
              Plan your perfect trip with AI-powered tools, collaborate with friends, 
              and create memories that last a lifetime.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { icon: '🗺️', label: 'Smart Planning' },
                { icon: '💰', label: 'Budget Tracking' },
                { icon: '👥', label: 'Group Travel' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
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
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold gradient-text">TravelMate AI</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
