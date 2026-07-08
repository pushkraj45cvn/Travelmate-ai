import api from './api';

const tripService = {
  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data.data;
  },

  getTrips: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const query = queryParams.toString();
    const response = await api.get(`/trips${query ? `?${query}` : ''}`);
    return response.data;
  },

  getTrip: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data.data;
  },

  updateTrip: async (id, tripData) => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data.data;
  },

  deleteTrip: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  duplicateTrip: async (id) => {
    const response = await api.post(`/trips/${id}/duplicate`);
    return response.data.data;
  },

  archiveTrip: async (id) => {
    const response = await api.put(`/trips/${id}/archive`);
    return response.data.data;
  },

  updateTripStatus: async (id, status) => {
    const response = await api.put(`/trips/${id}/status`, { status });
    return response.data.data;
  },
};

export default tripService;
