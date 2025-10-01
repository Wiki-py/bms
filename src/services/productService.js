import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const productService = {
  // Get all products
  async getProducts(params = {}) {
    const response = await api.get(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  // Get single product
  async getProduct(id) {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS}${id}/`);
    return response.data;
  },

  // Create product
  async createProduct(productData) {
    const response = await api.post(API_ENDPOINTS.PRODUCTS, productData);
    return response.data;
  },

  // Update product
  async updateProduct(id, productData) {
    const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}${id}/`, productData);
    return response.data;
  },

  // Delete product
  async deleteProduct(id) {
    const response = await api.delete(`${API_ENDPOINTS.PRODUCTS}${id}/`);
    return response.data;
  },

  // Get low stock products
  async getLowStock() {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS}low_stock/`);
    return response.data;
  },

  // Get out of stock products
  async getOutOfStock() {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS}out_of_stock/`);
    return response.data;
  },
};