import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiStar } from 'react-icons/fi';

const planDetails = {
  pro: { name: 'Pro', price: '$9', color: 'from-primary-500 to-accent-500', features: ['Unlimited trips', 'Destination guides & wishlists', 'Trip invitations & collaboration', 'AI travel assistant', 'Priority support'] },
  team: { name: 'Team', price: '$19', color: 'from-accent-500 to-pink-500', features: ['Everything in Pro', 'Unlimited collaborators', 'Team dashboards', 'Admin controls', 'Advanced analytics'] },
};

const Payment = () => {
  const { planId } = useParams();
  const plan = planDetails[planId];

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
          <Link to="/settings?tab=plan" className="text-primary-500 hover:underline">← Back to Plans</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <Link to="/settings?tab=plan" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-900 dark:hover:text-dark-100 mb-8 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Plans
        </Link>

        <div className="card p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
            <FiStar className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold mb-2">{plan.name} Plan</h1>
          <div className="mb-6">
            <span className="text-5xl font-black">{plan.price}</span>
            <span className="text-lg text-dark-400">/month</span>
          </div>

          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <FiClock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 gradient-text">Coming Soon</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-sm mx-auto mb-8">
              We're building a seamless payment experience. You'll be able to subscribe to the <strong>{plan.name}</strong> plan shortly.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold opacity-60 cursor-not-allowed">
              <FiClock className="w-4 h-4" />
              Subscribe — Coming Soon
            </div>
          </div>

          <div className={`h-px bg-gradient-to-r ${plan.color} mb-6 opacity-30`} />

          <h3 className="font-semibold mb-4 text-left">What's included:</h3>
          <ul className="space-y-3 text-left">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-dark-600 dark:text-dark-300">
                <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;
