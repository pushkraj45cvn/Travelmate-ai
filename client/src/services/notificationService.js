import api from './api';

const notificationService = {
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/notifications${query ? `?${query}` : ''}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
