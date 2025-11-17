import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Payment Methods
export const getPaymentMethods = () => api.get('/payment-methods');
export const createPaymentMethod = (data) => api.post('/payment-methods', data);
export const deletePaymentMethod = (id) => api.delete(`/payment-methods/${id}`);

// Subscriptions
export const getSubscriptions = (isActive = null) => {
  const params = isActive !== null ? { is_active: isActive } : {};
  return api.get('/subscriptions', { params });
};
export const getSubscription = (id) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data) => api.post('/subscriptions', data);
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data);
export const deleteSubscription = (id) => api.delete(`/subscriptions/${id}`);

// Transactions
export const getTransactions = () => api.get('/transactions');
export const importCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/transactions/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Notifications
export const getNotifications = (unreadOnly = false) => {
  const params = unreadOnly ? { unread_only: true } : {};
  return api.get('/notifications', { params });
};
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/mark-all-read');

// Analytics
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getMonthlySpend = (months = 12) => api.get(`/analytics/monthly?months=${months}`);
export const getYearlySpend = () => api.get('/analytics/yearly');
export const getSpendingByPaymentMethod = () => api.get('/analytics/by-payment-method');

export default api;
