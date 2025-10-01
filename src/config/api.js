const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/token/`,
    REFRESH: `${API_BASE}/auth/token/refresh/`,
    PROFILE: `${API_BASE}/users/profile/`,
  },
  USERS: `${API_BASE}/users/`,
  PRODUCTS: `${API_BASE}/products/`,
  INVENTORY: `${API_BASE}/inventory/`,
  SALES: `${API_BASE}/sales/`,
  BRANCHES: `${API_BASE}/branches/`,
  REPORTS: `${API_BASE}/reports/`,
  NOTIFICATIONS: `${API_BASE}/notifications/`,
};

export default API_BASE;