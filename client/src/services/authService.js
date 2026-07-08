import api from './api';

const AUTH_ENDPOINT = '/auth';

const authService = {
  register: async (userData) => {
    const response = await api.post(`${AUTH_ENDPOINT}/register`, userData);
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (userData) => {
    const response = await api.post(`${AUTH_ENDPOINT}/login`, userData);
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get(`${AUTH_ENDPOINT}/me`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.put(`${AUTH_ENDPOINT}/reset-password/${token}`, { password });
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put(`${AUTH_ENDPOINT}/update-password`, passwordData);
    return response.data;
  },

  googleLogin: async (userData) => {
    const response = await api.post(`${AUTH_ENDPOINT}/google`, userData);
    if (response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`${AUTH_ENDPOINT}/verify-email/${token}`);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post(`${AUTH_ENDPOINT}/refresh-token`, { refreshToken });
    return response.data;
  },
};

export default authService;
