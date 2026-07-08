import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        {status === 'loading' && (
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
            <h2 className="text-3xl font-bold mb-4">Email Verified!</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8">Your email has been successfully verified.</p>
            <Link to="/auth/login" className="btn-primary">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-4xl mx-auto mb-6">❌</div>
            <h2 className="text-3xl font-bold mb-4">Verification Failed</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8">The verification link is invalid or expired.</p>
            <Link to="/auth/login" className="btn-primary">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
