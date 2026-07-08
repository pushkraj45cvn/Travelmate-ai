import api from './api';

const destinationService = {
  getDestinations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/destinations${query ? `?${query}` : ''}`);
    return response.data;
  },

  getDestination: async (id) => {
    const response = await api.get(`/destinations/${id}`);
    return response.data.data;
  },

  getWishlist: async () => {
    const response = await api.get('/destinations/wishlist/me');
    return response.data.data;
  },

  addToWishlist: async (data) => {
    const response = await api.post('/destinations/wishlist', data);
    return response.data.data;
  },

  removeFromWishlist: async (destinationId) => {
    const response = await api.delete(`/destinations/wishlist/${destinationId}`);
    return response.data.data;
  },
};

export default destinationService;
