import api from './api';

export const productsAPI = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}/`),
  create: (product) => api.post('/products/', product),
  update: (id, product) => api.put(`/products/${id}/`, product),
  delete: (id) => api.delete(`/products/${id}/`),
  getLowStock: () => api.get('/products/low_stock/'),
};