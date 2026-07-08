import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-8xl mb-6">🗺️</div>
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8">
          Looks like you've wandered off the map. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link to="/" className="btn-secondary">Home</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
