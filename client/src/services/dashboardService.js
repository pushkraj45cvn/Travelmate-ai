import api from './api';

const dashboardService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  },
};

export default dashboardService;
