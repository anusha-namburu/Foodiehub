import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodiehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for clear errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),
  register: (userData) => api.post('/auth/register', userData).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((res) => res.data),
  getAddresses: () => api.get('/auth/addresses').then((res) => res.data),
  addAddress: (data) => api.post('/auth/addresses', data).then((res) => res.data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`).then((res) => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),
};

export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }).then((res) => res.data),
  getDetail: (id) => api.get(`/restaurants/${id}`).then((res) => res.data),
  toggleFavourite: (id) => api.post(`/restaurants/${id}/favourite`).then((res) => res.data),
  getCuisines: () => api.get('/restaurants/cuisines').then((res) => res.data),
};

export const foodAPI = {
  getAll: (params) => api.get('/food', { params }).then((res) => res.data),
  getDetail: (id) => api.get(`/food/${id}`).then((res) => res.data),
  getCategories: () => api.get('/food/categories').then((res) => res.data),
  getBestsellers: (limit = 8) => api.get('/food/bestsellers', { params: { limit } }).then((res) => res.data),
};

export const cartAPI = {
  getCart: () => api.get('/cart').then((res) => res.data),
  addItem: (data) => api.post('/cart', data).then((res) => res.data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data).then((res) => res.data),
  removeItem: (id) => api.delete(`/cart/${id}`).then((res) => res.data),
  clearCart: () => api.delete('/cart/clear').then((res) => res.data),
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data).then((res) => res.data),
  getUserOrders: () => api.get('/orders').then((res) => res.data),
  getTracking: (identifier) => api.get(`/orders/${identifier}`).then((res) => res.data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`).then((res) => res.data),
};

export const couponAPI = {
  getCoupons: () => api.get('/coupons').then((res) => res.data),
  applyCoupon: (code, subtotal) => api.post('/coupons/apply', { code, subtotal }).then((res) => res.data),
};

export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }).then((res) => res.data),
  addReview: (data) => api.post('/reviews', data).then((res) => res.data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  getRestaurants: () => api.get('/admin/restaurants').then((res) => res.data),
  createRestaurant: (data) => api.post('/admin/restaurants', data).then((res) => res.data),
  updateRestaurant: (id, data) => api.put(`/admin/restaurants/${id}`, data).then((res) => res.data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`).then((res) => res.data),
  getFoods: () => api.get('/admin/foods').then((res) => res.data),
  createFood: (data) => api.post('/admin/foods', data).then((res) => res.data),
  updateFood: (id, data) => api.put(`/admin/foods/${id}`, data).then((res) => res.data),
  deleteFood: (id) => api.delete(`/admin/foods/${id}`).then((res) => res.data),
  getCategories: () => api.get('/admin/categories').then((res) => res.data),
  createCategory: (data) => api.post('/admin/categories', data).then((res) => res.data),
  getOrders: (params) => api.get('/admin/orders', { params }).then((res) => res.data),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }).then((res) => res.data),
  getCustomers: () => api.get('/admin/customers').then((res) => res.data),
  getCoupons: () => api.get('/admin/coupons').then((res) => res.data),
  createCoupon: (data) => api.post('/admin/coupons', data).then((res) => res.data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`).then((res) => res.data),
};

export default api;
