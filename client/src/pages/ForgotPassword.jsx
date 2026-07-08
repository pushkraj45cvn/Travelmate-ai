import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
    } catch (err) {
      // handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/auth/login" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {isSent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              We've sent a password reset link to your email address.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
