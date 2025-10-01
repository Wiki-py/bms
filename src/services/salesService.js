import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const salesService = {
  // Get all sales
  async getSales(params = {}) {
    const response = await api.get(API_ENDPOINTS.SALES, { params });
    return response.data;
  },

  // Create sale
  async createSale(saleData) {
    const response = await api.post(API_ENDPOINTS.SALES, saleData);
    return response.data;
  },

  // Get today's sales
  async getTodaySales() {
    const response = await api.get(`${API_ENDPOINTS.SALES}today_sales/`);
    return response.data;
  },

  // Get sales report
  async getSalesReport(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(`${API_ENDPOINTS.SALES}sales_report/`, { params });
    return response.data;
  },
};