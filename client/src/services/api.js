import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Inject X-Demo-User-Id header before requests
API.interceptors.request.use((config) => {
  const activeUserId = localStorage.getItem('borrowbox_demo_user_id');
  if (activeUserId) {
    config.headers['X-Demo-User-Id'] = activeUserId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API helper methods
export const fetchUsers = () => API.get('/users');
export const registerUser = (userData) => API.post('/users/register', userData);
export const loginUser = (credentials) => API.post('/users/login', credentials);
export const fetchCurrentUser = () => API.get('/users/me');
export const fetchItems = (params) => API.get('/items', { params });
export const fetchItemById = (id) => API.get(`/items/${id}`);
export const createItem = (itemData) => API.post('/items', itemData);
export const updateItem = (id, itemData) => API.put(`/items/${id}`, itemData);
export const deleteItem = (id) => API.delete(`/items/${id}`);

export const fetchRequests = (params) => API.get('/requests', { params });
export const createRequest = (requestData) => API.post('/requests', requestData);
export const updateRequestStatus = (id, status) => API.put(`/requests/${id}`, { status });
export const deleteRequest = (id) => API.delete(`/requests/${id}`);

export const fetchDashboard = () => API.get('/dashboard');
export const improveDescription = (payload) => API.post('/ai/improve-description', payload);

export default API;
