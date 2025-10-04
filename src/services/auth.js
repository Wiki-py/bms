import api from './api';

export const authAPI = {
  // JWT Token login (matches your Django endpoint)
  login: (credentials) => api.post('/api/auth/token/', credentials),
  
  // Get current user profile (matches your Django endpoint)
  getCurrentUser: () => api.get('/api/auth/users/profile/'),
  
  // Refresh token
  refreshToken: (refreshToken) => api.post('/api/auth/token/refresh/', { refresh: refreshToken }),
  
  // For JWT, logout is client-side (remove tokens)
  logout: () => Promise.resolve(), // Client will remove tokens from storage
};