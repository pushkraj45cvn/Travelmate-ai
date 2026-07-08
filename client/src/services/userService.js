import api from './api';

const userService = {
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getTravelHistory: async () => {
    const response = await api.get('/users/travel-history');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/users/achievements');
    return response.data.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },
};

export default userService;
