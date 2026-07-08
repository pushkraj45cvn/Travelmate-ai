import api from './api';

const packingService = {
  getPackingList: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/packing`);
    return response.data.data;
  },

  upsertPackingList: async (tripId, data) => {
    const response = await api.put(`/trips/${tripId}/packing`, data);
    return response.data.data;
  },

  addItem: async (tripId, itemData) => {
    const response = await api.post(`/trips/${tripId}/packing/items`, itemData);
    return response.data.data;
  },

  updateItem: async (tripId, itemId, itemData) => {
    const response = await api.put(`/trips/${tripId}/packing/items/${itemId}`, itemData);
    return response.data.data;
  },

  toggleItem: async (tripId, itemId) => {
    const response = await api.put(`/trips/${tripId}/packing/items/${itemId}/toggle`);
    return response.data.data;
  },

  deleteItem: async (tripId, itemId) => {
    const response = await api.delete(`/trips/${tripId}/packing/items/${itemId}`);
    return response.data.data;
  },
};

export default packingService;
