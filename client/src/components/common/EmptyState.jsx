import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, description, actionLabel, actionLink, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center text-4xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-dark-500 dark:text-dark-400 text-center max-w-md mb-6">
        {description}
      </p>
      {actionLabel && (actionLink ? (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      ) : null)}
    </motion.div>
  );
};

export default EmptyState;
