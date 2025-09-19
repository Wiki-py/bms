import api from './api';

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
};