import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './auth';

const API_BASE_URL = 'https://pos-backend-8i4g.onrender.com/api'; // New POS Backend URL

// Create axios instance or fetch wrapper
const api = {
  // Request interceptor to add auth token
  request: async (url, options = {}) => {
    const token = await AsyncStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      // Handle token expiration
      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await authAPI.refreshToken(refreshToken);
          if (refreshResponse.ok) {
            const newTokens = await refreshResponse.json();
            await AsyncStorage.setItem('access_token', newTokens.access);
            // Retry original request with new token
            headers.Authorization = `Bearer ${newTokens.access}`;
            return fetch(`${API_BASE_URL}${url}`, config);
          }
        }
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        throw new Error('Authentication failed');
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  get: (url) => api.request(url),
  
  post: (url, data) => 
    api.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (url, data) =>
    api.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (url) =>
    api.request(url, {
      method: 'DELETE',
    }),
};

export default api;