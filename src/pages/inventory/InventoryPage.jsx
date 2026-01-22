import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// API base URL - New POS Backend
const API_BASE = 'https://pos-backend-8i4g.onrender.com/api';

// Constants
const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
};

const CHART_COLORS = {
  Electronics: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
  Clothing: { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' },
  Food: { bg: 'rgba(251, 191, 36, 0.8)', border: 'rgba(251, 191, 36, 1)' },
  Furniture: { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' },
};

// Mock data
const mockItems = [
  { id: 1, name: 'Laptop', quantity: 3, price: 999.99, category: 'Electronics', created_at: '2025-09-01T10:00:00Z' },
  { id: 2, name: 'T-Shirt', quantity: 10, price: 19.99, category: 'Clothing', created_at: '2025-09-02T12:00:00Z' },
  { id: 3, name: 'Coffee', quantity: 0, price: 5.99, category: 'Food', created_at: '2025-09-03T14:00:00Z' },
  { id: 4, name: 'Chair', quantity: 2, price: 49.99, category: 'Furniture', created_at: '2025-09-04T16:00:00Z' },
  { id: 5, name: 'Headphones', quantity: 8, price: 199.99, category: 'Electronics', created_at: '2025-09-05T09:00:00Z' },
  { id: 6, name: 'Jeans', quantity: 5, price: 59.99, category: 'Clothing', created_at: '2025-09-06T11:00:00Z' },
];

// Utility functions
const formatCurrency = (amount) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const calculateDaysAgo = (createdAt, currentDate) => {
  const createdDate = new Date(createdAt);
  const diffTime = currentDate - createdDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

const getStockStatus = (quantity) => {
  if (quantity === STOCK_THRESHOLDS.OUT_OF_STOCK) return 'out';
  if (quantity <= STOCK_THRESHOLDS.LOW_STOCK) return 'low';
  return 'normal';
};

// Component: Stat Card
const StatCard = ({ title, value, icon, gradient, delay = 0 }) => (
  <div 
    className={`group bg-gradient-to-br ${gradient} text-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm sm:text-base font-medium opacity-90 mb-2">{title}</h2>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="text-5xl sm:text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
  </div>
);

// Component: Alert Card
const AlertCard = ({ title, items, icon, bgGradient, borderColor, textColor, emptyMessage }) => (
  <div className={`bg-gradient-to-br ${bgGradient} border ${borderColor} rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300`}>
    <div className={`flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-xl mb-4`}>
      <h2 className={`text-lg sm:text-xl font-semibold ${textColor}`}>{title}</h2>
      <div className="text-3xl">{icon}</div>
    </div>
    {items.length > 0 ? (
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className={`flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg ${textColor} font-medium`}>
            <span className="text-xl">{icon}</span>
            <span className="flex-1">{item.name}</span>
            {item.quantity > 0 && (
              <span className="text-sm opacity-75">Qty: {item.quantity}</span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p className={`${textColor} italic text-center py-4`}>{emptyMessage}</p>
    )}
  </div>
);

// Component: Action Button
const ActionButton = ({ onClick, icon, text, gradient, hoverGradient }) => (
  <button 
    onClick={onClick}
    className={`group bg-gradient-to-r ${gradient} hover:${hoverGradient} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base font-semibold flex items-center justify-center gap-2`}
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </button>
);

// Main Component
const InventoryReport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = useMemo(() => new Date('2025-09-22T00:00:00Z'), []);
  const navigate = useNavigate();

  // API call handler with token refresh
  const apiCall = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    const makeRequest = async (token) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
      return response;
    };
    
    let response = await makeRequest(accessToken);
    
    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAccessToken = data.access;
            localStorage.setItem('access_token', newAccessToken);
            localStorage.setItem('access', newAccessToken);
            
            // Retry the original request with new token
            response = await makeRequest(newAccessToken);
          } else {
            throw new Error('UNAUTHORIZED');
          }
        } catch (refreshError) {
          throw new Error('UNAUTHORIZED');
        }
      } else {
        throw new Error('UNAUTHORIZED');
      }
    }
    
    return response;
  }, [API_BASE]);

  // Handle authentication errors
  const handleAuthError = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!accessToken) {
          handleAuthError();
          return;
        }
        
        // Try to fetch from API first
        const response = await apiCall(`${API_BASE}/inventory/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const data = await response.json();
        
        // Handle different API response formats
        let itemsArray = [];
        if (Array.isArray(data)) {
          itemsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          itemsArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          itemsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          // Fallback to mock data if API returns unexpected format
          itemsArray = mockItems;
        }
        
        setItems(itemsArray);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.message === 'UNAUTHORIZED') {
          handleAuthError();
        } else {
          setError(err.message || 'Failed to load inventory data');
          // Fallback to mock data on error
          setItems(mockItems);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [API_BASE, apiCall, handleAuthError]);

  // Memoized calculations
  const stats = useMemo(() => {
    const inventoryValue = items.reduce((total, item) => total + item.quantity * item.price, 0);
    const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= STOCK_THRESHOLDS.LOW_STOCK);
    const outOfStockItems = items.filter(item => item.quantity === STOCK_THRESHOLDS.OUT_OF_STOCK);
    
    return {
      inventoryValue,
      lowStockItems,
      outOfStockItems,
    };
  }, [items]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const categoryValues = items.reduce((acc, item) => {
      const value = item.quantity * item.price;
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryValues),
      datasets: [{
        label: 'Inventory Value by Category',
        data: Object.values(categoryValues),
        backgroundColor: Object.keys(categoryValues).map(cat => CHART_COLORS[cat]?.bg || 'rgba(156, 163, 175, 0.8)'),
        borderColor: Object.keys(categoryValues).map(cat => CHART_COLORS[cat]?.border || 'rgba(156, 163, 175, 1)'),
        borderWidth: 2,
      }],
    };
  }, [items]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 14, weight: '600' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Handlers
  const handleUpdateInventory = () => {
    navigate('/inventory/update');
  };

  const handleExportReport = () => {
    // Generate CSV report
    const csvContent = generateCSVReport();
    downloadCSV(csvContent, 'inventory-report.csv');
  };

  const handlePrintReport = () => {
    // Print the report
    window.print();
  };

  // Generate CSV Report
  const generateCSVReport = useCallback(() => {
    const headers = ['Item Name', 'Quantity', 'Price', 'Category', 'Total Value', 'Date Added'];
    const rows = items.map(item => [
      item.name,
      item.quantity,
      item.price.toFixed(2),
      item.category,
      (item.quantity * item.price).toFixed(2),
      new Date(item.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }, [items]);

  // Download CSV file
  const downloadCSV = useCallback((content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Styling helpers
  const getStockClass = (quantity) => {
    const status = getStockStatus(quantity);
    if (status === 'out') return 'text-red-600 font-bold';
    if (status === 'low') return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const getRowClass = (quantity) => {
    const status = getStockStatus(quantity);
    if (status === 'out') return 'bg-red-50/80 hover:bg-red-100/80';
    if (status === 'low') return 'bg-orange-50/80 hover:bg-orange-100/80';
    return 'bg-white hover:bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading inventory data...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Inventory</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {!loading && !error && (
          <div>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Inventory Report
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Comprehensive overview of your stock levels and values
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <ActionButton 
                  onClick={handleUpdateInventory}
                  icon="✏️"
                  text="Update Inventory"
                  gradient="from-blue-500 to-purple-600"
                  hoverGradient="from-blue-600 to-purple-700"
                />
                <ActionButton 
                  onClick={handleExportReport}
                  icon="📊"
                  text="Export Report"
                  gradient="from-emerald-500 to-teal-600"
                  hoverGradient="from-emerald-600 to-teal-700"
                />
                <ActionButton 
                  onClick={handlePrintReport}
                  icon="🖨️"
                  text="Print Report"
                  gradient="from-indigo-500 to-purple-600"
                  hoverGradient="from-indigo-600 to-purple-700"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard 
                title="Total Inventory Value"
                value={formatCurrency(stats.inventoryValue)}
                icon="💰"
                gradient="from-emerald-500 to-teal-600"
                delay={0}
              />
              <StatCard 
                title="Low Stock Items"
                value={stats.lowStockItems.length}
                icon="⚠️"
                gradient="from-orange-500 to-amber-600"
                delay={100}
              />
              <StatCard 
                title="Out of Stock Items"
                value={stats.outOfStockItems.length}
                icon="🚫"
                gradient="from-red-500 to-pink-600"
                delay={200}
              />
            </div>

            {/* Chart Section */}
            <div className="bg-white/90 backdrop-blur-lg p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200/50 mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
                Inventory Value by Category
              </h2>
              <div className="h-80 sm:h-96">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <AlertCard 
                title="Low Stock Alerts"
                items={stats.lowStockItems}
                icon="⚠️"
                bgGradient="from-yellow-50 to-orange-50"
                borderColor="border-orange-300"
                textColor="text-orange-800"
                emptyMessage="No low stock items. Great job! 🎉"
              />
              <AlertCard 
                title="Out of Stock Alerts"
                items={stats.outOfStockItems}
                icon="🚨"
                bgGradient="from-red-50 to-pink-50"
                borderColor="border-red-300"
                textColor="text-red-800"
                emptyMessage="No out of stock items. All good! ✅"
              />
            </div>

            {/* Inventory Table */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Inventory Summary</h2>
                <div className="text-sm text-gray-600 font-medium">
                  <span className="font-bold text-gray-800">{items.length}</span> items • 
                  <span className="text-orange-600 ml-1 font-semibold">{stats.lowStockItems.length} low</span> • 
                  <span className="text-red-600 ml-1 font-semibold">{stats.outOfStockItems.length} out</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`${getRowClass(item.quantity)} transition-all duration-200`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                          <td className={`px-6 py-4 ${getStockClass(item.quantity)} text-lg`}>
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-medium">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-bold">{formatCurrency(item.quantity * item.price)}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{calculateDaysAgo(item.created_at, currentDate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-lg">
                          No inventory items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 pb-8">
              <ActionButton 
                onClick={handleUpdateInventory}
                icon="✏️"
                text="Update Inventory Items"
                gradient="from-blue-500 to-purple-600"
                hoverGradient="from-blue-600 to-purple-700"
              />
              <ActionButton 
                onClick={handleExportReport}
                icon="📊"
                text="Export Full Report"
                gradient="from-emerald-500 to-teal-600"
                hoverGradient="from-emerald-600 to-teal-700"
              />
              <ActionButton 
                onClick={handlePrintReport}
                icon="🖨️"
                text="Print Report"
                gradient="from-indigo-500 to-purple-600"
                hoverGradient="from-indigo-600 to-purple-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReport;