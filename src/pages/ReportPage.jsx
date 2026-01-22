import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - Previous link
  const API_BASE = 'https://bms-api-2.onrender.com/api';

  // Centralized API call handler with automatic token refresh
  const apiCall = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!accessToken) {
      throw new Error('UNAUTHORIZED');
    }

    const makeRequest = async (token) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
      
      if (!refreshToken) {
        throw new Error('UNAUTHORIZED');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('UNAUTHORIZED');
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('access', accessToken);

        response = await makeRequest(accessToken);
      } catch (error) {
        throw new Error('UNAUTHORIZED');
      }
    }

    return response;
  }, [API_BASE]);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!accessToken) {
          handleAuthError();
          return;
        }

        const response = await apiCall(`${API_BASE}/reports/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        
        // Handle different response formats
        let reportsArray = [];
        if (Array.isArray(data)) {
          reportsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          reportsArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          reportsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          reportsArray = [];
        }

        setReportsData(reportsArray);
      } catch (err) {
        console.error('Fetch error:', err);
        
        if (err.message === 'UNAUTHORIZED') {
          handleAuthError();
        } else {
          setError(err.message || 'Failed to load reports');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API_BASE, apiCall, handleAuthError]);

  // Prepare data with fallbacks
  const salesData = reportsData.filter((report) => report.type === 'Sales') || [];
  const inventoryData = reportsData.filter((report) => report.type === 'Inventory') || [];
  const customerData = reportsData.filter((report) => report.type === 'Customer') || [];

  const salesChartData = salesData.length > 0 ? {
    labels: salesData.map((report) => report.period),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map((report) => report.revenue || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: salesData.map((report) => report.expenses || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: 'Profit',
        data: salesData.map((report) => report.profit || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  } : null;

  const inventoryChartData = inventoryData.length > 0 ? {
    labels: inventoryData.map((report) => report.period),
    datasets: [
      {
        label: 'Stock Levels',
        data: inventoryData.map((report) => report.stockLevel || 0),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const customerChartData = customerData.length > 0 ? {
    labels: customerData.map((report) => report.period),
    datasets: [
      {
        label: 'Satisfaction',
        data: customerData.map((report) => report.satisfaction || 0),
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          usePointStyle: true, 
          padding: 15,
          font: { size: 12, weight: 'bold' }
        } 
      },
      title: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          usePointStyle: true, 
          padding: 15,
          font: { size: 12, weight: 'bold' }
        } 
      },
      title: { display: false },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-violet-600 to-pink-600 rounded-full w-24 h-24 flex items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white/90 backdrop-blur-xl border border-red-200 rounded-3xl max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = salesData.reduce((sum, report) => sum + (report.revenue || 0), 0);
  const totalExpenses = salesData.reduce((sum, report) => sum + (report.expenses || 0), 0);
  const totalProfit = salesData.reduce((sum, report) => sum + (report.profit || 0), 0);
  const avgSatisfaction = customerData.length > 0 
    ? (customerData.reduce((sum, report) => sum + (report.satisfaction || 0), 0) / customerData.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            Reports Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive business analytics and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group relative bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Revenue</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{salesData.length} sales reports</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Expenses</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                ${totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Operational costs</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Net Profit</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${totalProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">After expenses</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Satisfaction</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {avgSatisfaction}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{customerData.length} customer reports</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-10"></div>
            <div className="relative">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Sales Performance
              </h2>
              {salesChartData ? (
                <div className="h-80">
                  <Bar data={salesChartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg font-medium">No sales data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-10"></div>
            <div className="relative">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                Inventory Stock Levels
              </h2>
              {inventoryChartData ? (
                <div className="h-80">
                  <Pie data={inventoryChartData} options={pieChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-lg font-medium">No inventory data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Satisfaction Chart */}
        {customerChartData && (
          <div className="mb-10">
            <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl opacity-10"></div>
              <div className="relative">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Customer Satisfaction Distribution
                </h2>
                <div className="h-64">
                  <Pie data={customerChartData} options={pieChartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-3xl opacity-10"></div>
          <div className="relative overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Period</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Revenue</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Expenses</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Profit</th>
                  <th className="py-4 px-6 border-b-2 border-violet-200 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No reports data available yet</p>
                        <p className="text-gray-400 text-sm mt-1">Generate your first report to see data here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reportsData.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-bold text-gray-800">#{report.id}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                          report.type === 'Sales'
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                            : report.type === 'Inventory'
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200'
                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
                        }`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-700">{report.period}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-emerald-600 hidden md:table-cell">
                        {report.revenue !== null && report.revenue !== undefined ? `${Number(report.revenue).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-red-600 hidden lg:table-cell">
                        {report.expenses !== null && report.expenses !== undefined ? `${Number(report.expenses).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-blue-600 hidden lg:table-cell">
                        {report.profit !== null && report.profit !== undefined ? `${Number(report.profit).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex space-x-2">
                          <button className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-center">
          <button className="group relative bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-lg font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Generate New Report
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Reports;