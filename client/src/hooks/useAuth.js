import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, logout, googleLogin, reset } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
      toast.success('Welcome to TravelMate AI!');
    }
    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const handleLogin = async (userData) => {
    const result = await dispatch(login(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleGoogleLogin = async (userData) => {
    const result = await dispatch(googleLogin(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGoogleLogin,
  };
};
