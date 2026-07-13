import api from './api';

const paymentService = {
  subscribe: async (planId, paymentDetails) => {
    const response = await api.post('/subscriptions/subscribe', { planId, paymentDetails });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },
};

export default paymentService;
