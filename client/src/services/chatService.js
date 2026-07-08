import api from './api';

const chatService = {
  getOrCreateChat: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/chat`);
    return response.data.data;
  },

  getMessages: async (chatId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/trips/${chatId}/messages${query ? `?${query}` : ''}`);
    return response.data;
  },

  sendMessage: async (chatId, messageData) => {
    const response = await api.post(`/trips/${chatId}/messages`, messageData);
    return response.data.data;
  },
};

export default chatService;
