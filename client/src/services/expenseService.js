import api from './api';

const expenseService = {
  getExpenses: async (tripId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/trips/${tripId}/expenses${query ? `?${query}` : ''}`);
    return response.data;
  },

  createExpense: async (tripId, expenseData) => {
    const response = await api.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getExpenseSummary: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/expenses/summary`);
    return response.data.data;
  },

  getSplits: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/splits`);
    return response.data.data;
  },

  calculateSplits: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/splits/calculate`);
    return response.data.data;
  },

  settleDebt: async (tripId, settlementData) => {
    const response = await api.post(`/trips/${tripId}/splits/settle`, settlementData);
    return response.data.data;
  },
};

export default expenseService;
