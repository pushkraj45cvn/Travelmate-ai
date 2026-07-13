import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiStar, FiLock, FiCreditCard, FiCheckCircle, FiAlertCircle, FiLoader, FiShield } from 'react-icons/fi';
import { setUser } from '../redux/slices/authSlice';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const planDetails = {
  pro: { name: 'Pro', price: '$9', priceNum: 9, color: 'from-primary-500 to-accent-500', features: ['Unlimited trips', 'Destination guides & wishlists', 'Trip invitations & collaboration', 'AI travel assistant', 'Priority support'] },
  team: { name: 'Team', price: '$19', priceNum: 19, color: 'from-accent-500 to-pink-500', features: ['Everything in Pro', 'Unlimited collaborators', 'Team dashboards', 'Admin controls', 'Advanced analytics'] },
};

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const plan = planDetails[planId];

  const [step, setStep] = useState('form'); // form | processing | success | error
  const [form, setForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

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

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    const rawCard = form.cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16 || isNaN(rawCard)) newErrors.cardNumber = 'Enter a valid 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) newErrors.expiry = 'Use MM/YY format';
    if (!/^\d{3,4}$/.test(form.cvv)) newErrors.cvv = 'Enter a valid CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('processing');

    try {
      const response = await paymentService.subscribe(planId, {
        cardholderName: form.cardholderName,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiry: form.expiry,
        cvv: form.cvv,
      });

      // Update Redux store with new user data (plan upgraded)
      if (response.data?.user) {
        dispatch(setUser(response.data.user));
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setStep('success');
      toast.success(response.message || `Welcome to ${plan.name}!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      setErrorMessage(msg);
      setStep('error');
      toast.error(msg);
    }
  };

  const handleBackToSettings = () => {
    navigate('/settings?tab=plan');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
        <Link to="/settings?tab=plan" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-900 dark:hover:text-dark-100 mb-6 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Plans
        </Link>

        <AnimatePresence mode="wait">
          {/* ---- PAYMENT FORM ---- */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card p-6 md:p-8">
              {/* Plan Summary */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-200 dark:border-dark-700">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <FiStar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold">{plan.name} Plan</h1>
                  <p className="text-sm text-dark-400">
                    <span className="text-xl font-black text-dark-900 dark:text-white">{plan.price}</span>
                    <span className="text-dark-400">/month</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dark-400">Due today</p>
                  <p className="text-lg font-black text-dark-900 dark:text-white">{plan.price}.00</p>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.cardholderName ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-700'} bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                  />
                  {errors.cardholderName && <p className="text-xs text-red-500 mt-1">{errors.cardholderName}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={form.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.cardNumber ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-700'} bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all pl-10`}
                    />
                    <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  </div>
                  {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={(e) => handleInputChange('expiry', formatExpiry(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.expiry ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-700'} bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                    />
                    {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={form.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.cvv ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-700'} bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                    />
                    {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                {/* Dummy card hint */}
                <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5" />
                    Test Card: 4242 4242 4242 4242 | Any future date | Any 3-digit CVV
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <FiLock className="w-4 h-4" />
                  Pay {plan.price}.00 — Subscribe to {plan.name}
                </button>

                <p className="text-xs text-dark-400 text-center mt-3">
                  Your payment is secure and encrypted. This is a dummy payment gateway for testing.
                </p>
              </form>
            </motion.div>
          )}

          {/* ---- PROCESSING ---- */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                <FiLoader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-dark-500 dark:text-dark-400">
                Please wait while we securely process your payment for the <strong>{plan.name}</strong> plan...
              </p>
              <div className="mt-6 flex justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </motion.div>
          )}

          {/* ---- SUCCESS ---- */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 gradient-text">Payment Successful!</h2>
              <p className="text-dark-500 dark:text-dark-400 mb-6">
                Welcome to the <strong>{plan.name}</strong> plan! You now have access to all premium features.
              </p>

              <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-500">{plan.name} Plan</span>
                  <span className="font-semibold">{plan.price}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Status</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Active</span>
                </div>
              </div>

              <button
                onClick={handleBackToSettings}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                Go to Settings
              </button>
            </motion.div>
          )}

          {/* ---- ERROR ---- */}
          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <FiAlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-dark-500 dark:text-dark-400 mb-6">{errorMessage}</p>

              <button
                onClick={() => setStep('form')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all mb-3"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToSettings}
                className="w-full py-3 rounded-xl border border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 font-semibold hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
              >
                Back to Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Summary (shown on form step) */}
        {step === 'form' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 mt-4">
            <h3 className="font-semibold mb-3 text-sm">What's included in {plan.name}:</h3>
            <ul className="space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-300">
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Payment;
