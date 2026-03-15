import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  facebookAuth: (data) => api.post('/auth/facebook', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update', data),
  changePassword: (data) => api.put('/auth/password', data),
  getNotifications: () => api.get('/auth/notifications'),
  markAllNotificationsRead: () => api.put('/auth/notifications/read'),
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}/read`),
};

// Listings API
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getFeatured: () => api.get('/listings/featured'),
  getRecent: (limit = 8) => api.get('/listings/recent', { params: { limit } }),
  getStats: () => api.get('/listings/stats'),
  getById: (id) => api.get(`/listings/${id}`),
  getSimilar: (id) => api.get(`/listings/${id}/similar`),
  create: (formData) => {
    // FormData is already constructed in the component, just pass it through
    return api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, formData) => {
    // FormData is already constructed in the component, just pass it through
    return api.put(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id, reason) => api.delete(`/listings/${id}`, { data: { reason } }),
  toggleFavorite: (id) => api.post(`/listings/${id}/favorite`),
  report: (id, reason) => api.post(`/listings/${id}/report`, { reason }),
  markSold: (id) => api.put(`/listings/${id}/sold`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/auth/me'),
  getProfileById: (id) => api.get(`/users/${id}`),
  getListings: (id, params) => api.get(`/users/${id}/listings`, { params }),
  getMyListings: (params) => api.get('/users/me/listings', { params }),
  getMySoldListings: (params) => api.get('/users/me/listings', { params: { ...params, status: 'sold' } }),
  getFavorites: () => api.get('/users/me/favorites'),
  rateUser: (id, rating) => api.put(`/users/${id}/rate`, { rating }),
  blockUser: (userId) => api.post(`/users/block/${userId}`),
  unblockUser: (userId) => api.delete(`/users/block/${userId}`),
  getBlockedUsers: () => api.get('/users/blocked'),
};

// Listings API additional methods (aliases pointing to users routes)
listingsAPI.getMyListings = (params) => api.get('/users/me/listings', { params });
listingsAPI.getMySoldListings = (params) => api.get('/users/me/listings', { params: { ...params, status: 'sold' } });
listingsAPI.getFavorites = () => api.get('/users/me/favorites');
listingsAPI.markAsSold = (id) => api.put(`/listings/${id}/sold`);

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  startConversation: (listingId, sellerId) =>
    api.post('/messages/conversations', { listingId, sellerId }),
  createConversation: async ({ listingId, sellerId, message }) => {
    // Start conversation first
    const convResponse = await api.post('/messages/conversations', { listingId, sellerId });
    const conversation = convResponse.data.conversation;

    // Send initial message
    if (message) {
      await api.post(`/messages/${conversation._id}`, { content: message });
    }

    return convResponse;
  },
  sendMessage: (conversationId, content, type = 'text', offerAmount = null) =>
    api.post(`/messages/${conversationId}`, { content, type, ...(offerAmount ? { offerAmount } : {}) }),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteConversation: (id) => api.delete(`/messages/conversations/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getLocations: () => api.get('/categories/locations'),
  getConditions: () => api.get('/categories/conditions'),
  getFilters: () => api.get('/categories/filters'),
};

// Verification API
export const verificationAPI = {
  getStatus: () => api.get('/verification/status'),
  submit: (formData) => api.post('/verification/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Users Management
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserRole: (userId) => api.put(`/admin/users/${userId}/role`),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/status`),

  // Listings Management
  getListings: (params) => api.get('/admin/listings', { params }),
  moderateListing: (listingId, action, note) =>
    api.put(`/admin/listings/${listingId}/moderate`, { action, note }),
  deleteListing: (listingId) => api.delete(`/admin/listings/${listingId}`),

  // Reports
  getReports: (params) => api.get('/admin/reports', { params }),

  // Verifications
  getVerifications: (params) => api.get('/admin/verifications', { params }),
  reviewVerification: (userId, action, reason) =>
    api.put(`/admin/verifications/${userId}/review`, { action, reason }),

  // Categories Management
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  seedCategories: () => api.post('/admin/categories/seed'),
};

export default api;
