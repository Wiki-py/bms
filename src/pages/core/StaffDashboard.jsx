import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

// API base URL
const API_BASE = 'http://127.0.0.1:8000/api';

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', location: '' });
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState({});
  const [salesData, setSalesData] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setError('Please log in to access the dashboard.');
      navigate('/login');
    }
  }, [navigate]);

  // Axios instance with auth
  const getAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to access the dashboard.');
      return null;
    }
    return axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  // Token refresh interceptor
  useEffect(() => {
    const instance = axios.create({ baseURL: API_BASE });
    const interceptor = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');
            const refreshRes = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh: refreshToken });
            const newAccess = refreshRes.data.access;
            localStorage.setItem('access_token', newAccess);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return instance(originalRequest);
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setError('Session expired. Please log in again.');
            navigate('/login');
          }
        }
        return Promise.reject(error);
      }
    );
    return () => instance.interceptors.response.eject(interceptor);
  }, [navigate]);

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    const instance = getAxiosInstance();
    if (!instance) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches
        let fetchedBranches = [];
        try {
          const branchesRes = await instance.get('/branches/');
          fetchedBranches = branchesRes.data.map((branch) => ({
            ...branch,
            color:
              branch.type === 'Electronics'
                ? 'from-emerald-400 to-teal-500'
                : branch.type === 'Clothing'
                ? 'from-purple-400 to-pink-500'
                : 'from-orange-400 to-red-500',
            revenue: branch.revenue || 0,
            growth: branch.growth || 0,
          }));
          setBranches(fetchedBranches);
          setSelectedBranch(fetchedBranches[0]?.id || 'main');
        } catch (err) {
          console.error('Error fetching branches:', err.response?.data || err.message);
        }

        // Fetch notifications
        let notificationsData = [];
        try {
          const notificationsRes = await instance.get('/notifications/');
          notificationsData = notificationsRes.data.map((notification) => ({
            ...notification,
            branch: notification.branch?.id || notification.branch,
          }));
          setNotifications(notificationsData);
        } catch (err) {
          console.error('Error fetching notifications:', err.response?.data || err.message);
        }

        // Fetch branch-specific data
        const statsData = {};
        const employeesData = {};
        const salesDataMap = {};
        const inventoryDataMap = {};
        for (const branch of fetchedBranches) {
          try {
            const [statsRes, employeesRes, salesRes, inventoryRes] = await Promise.all([
              instance.get(`/branches/${branch.id}/stats/`).catch((err) => ({ error: err })),
              instance.get(`/branches/${branch.id}/employees/`).catch((err) => ({ error: err })),
              instance.get(`/branches/${branch.id}/sales/`).catch((err) => ({ error: err })),
              instance.get(`/branches/${branch.id}/inventory/`).catch((err) => ({ error: err })),
            ]);

            statsData[branch.id] = statsRes.error ? [] : statsRes.data;
            employeesData[branch.id] = employeesRes.error ? [] : statsRes.data;
            salesDataMap[branch.id] = salesRes.error
              ? { labels: [], datasets: [] }
              : {
                  labels: salesRes.data.labels || [],
                  datasets: salesRes.data.datasets?.map((ds) => ({
                    ...ds,
                    backgroundColor:
                      branch.type === 'Electronics'
                        ? 'rgba(34, 197, 94, 0.8)'
                        : branch.type === 'Clothing'
                        ? 'rgba(168, 85, 247, 0.8)'
                        : 'rgba(251, 191, 36, 0.8)',
                    borderColor:
                      branch.type === 'Electronics'
                        ? 'rgba(34, 197, 94, 1)'
                        : branch.type === 'Clothing'
                        ? 'rgba(168, 85, 247, 1)'
                        : 'rgba(251, 191, 36, 1)',
                    borderWidth: 2,
                  })) || [],
                };
            inventoryDataMap[branch.id] = inventoryRes.error
              ? { labels: [], datasets: [] }
              : {
                  labels: inventoryRes.data.labels || [],
                  datasets: [
                    {
                      label: 'Current Stock',
                      data: inventoryRes.data.datasets?.[0]?.data || inventoryRes.data.data || [],
                      backgroundColor: inventoryRes.data.colors || [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                      ],
                    },
                  ],
                };
          } catch (err) {
            console.error(`Error fetching data for branch ${branch.id}:`, err.response?.data || err.message);
          }
        }
        setStats(statsData);
        setEmployees(employeesData);
        setSalesData(salesDataMap);
        setInventoryData(inventoryDataMap);

        if (fetchedBranches.length === 0) {
          throw new Error('No branches fetched, using fallback.');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
        setError('Failed to load dashboard data. Using fallback.');
        setBranches([
          {
            id: 'main',
            name: 'Main Store',
            type: 'Electronics',
            location: 'Downtown',
            color: 'from-emerald-400 to-teal-500',
            revenue: 150000,
            growth: 8.2,
          },
          {
            id: 'outlet',
            name: 'Fashion Outlet',
            type: 'Clothing',
            location: 'City Mall',
            color: 'from-purple-400 to-pink-500',
            revenue: 80000,
            growth: 5.7,
          },
          {
            id: 'cafe',
            name: 'Urban Cafe',
            type: 'Food & Beverages',
            location: 'Uptown',
            color: 'from-orange-400 to-red-500',
            revenue: 45000,
            growth: 15.3,
          },
        ]);
        setNotifications([
          {
            id: 1,
            message: 'Low stock alert: Laptops (10 units) at Main Store',
            time: '10 mins ago',
            read: false,
            branch: 'main',
            type: 'warning',
          },
          {
            id: 2,
            message: 'Sales report generated for Q3 at Outlet',
            time: '1 hour ago',
            read: false,
            branch: 'outlet',
            type: 'info',
          },
          {
            id: 3,
            message: 'New employee onboarded at Cafe',
            time: '2 hours ago',
            read: true,
            branch: 'cafe',
            type: 'success',
          },
          {
            id: 4,
            message: 'High sales day at Main Store! 20% above average',
            time: '3 hours ago',
            read: false,
            branch: 'main',
            type: 'success',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  // Revenue trend data
  const revenueTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: branches.map((branch, index) => ({
      label: branch.name,
      data: [branch.revenue * 0.8, branch.revenue * 0.9, branch.revenue * 1.1, branch.revenue],
      borderColor:
        index === 0 ? 'rgba(34, 197, 94, 1)' : index === 1 ? 'rgba(168, 85, 247, 1)' : 'rgba(251, 191, 36, 1)',
      backgroundColor:
        index === 0
          ? 'rgba(34, 197, 94, 0.1)'
          : index === 1
          ? 'rgba(168, 85, 247, 0.1)'
          : 'rgba(251, 191, 36, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' } },
    },
  };

  const markAsRead = async (id) => {
    const instance = getAxiosInstance();
    if (!instance) return;
    try {
      await instance.patch(`/notifications/${id}/`, { read: true });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err.response?.data || err.message);
    }
  };

  const markAllAsRead = async () => {
    const instance = getAxiosInstance();
    if (!instance) return;
    try {
      await instance.post('/notifications/mark-all-read/');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err.response?.data || err.message);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setEditForm({ name: branch.name, type: branch.type, location: branch.location });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBranch) return;
    const instance = getAxiosInstance();
    if (!instance) return;
    try {
      const updatedBranch = await instance.put(`/branches/${editingBranch.id}/`, {
        ...editForm,
        revenue: editingBranch.revenue,
        growth: editingBranch.growth,
      });
      setBranches(branches.map((b) => (b.id === editingBranch.id ? { ...b, ...updatedBranch.data } : b)));
      setShowEditModal(false);
      setEditingBranch(null);
    } catch (err) {
      console.error('Error updating branch:', err.response?.data || err.message);
      setError('Failed to update branch.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '🎉';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (!user) {
    return null; // Wait for user to load
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-600"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 p-6 bg-white rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentBranch = branches.find((b) => b.id === selectedBranch) || branches[0] || {};
  const currentStats = stats[selectedBranch] || [];
  const currentEmployees = employees[selectedBranch] || [];
  const currentSalesData = salesData[selectedBranch] || { labels: [], datasets: [] };
  const currentInventoryData = inventoryData[selectedBranch] || { labels: [], datasets: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-2xl border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-3 text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="text-2xl">☰</span>
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Business Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Good {timeOfDay}, {user.name || user.username || 'User'}! Welcome back 👋
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedBranch || ''}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="appearance-none bg-white border border-indigo-200 rounded-xl px-4 py-2 text-sm font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} • {branch.location}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-600">
                  <span className="text-lg">▼</span>
                </div>
              </div>
              <div className="relative">
                <button className="p-2 rounded-xl text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors relative">
                  <span className="text-2xl">🔔</span>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center shadow-lg animate-pulse">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              <div className="hidden md:flex items-center space-x-3 bg-indigo-50/80 backdrop-blur-sm rounded-xl p-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name ? user.name.charAt(0) : user.username ? user.username.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-gray-900">{user.name || user.username || 'User'}</div>
                  <div className="text-xs text-gray-600">{user.role === 'admin' ? 'Admin Account' : 'Staff Account'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg shadow-2xl border-b border-indigo-100 z-40">
          <div className="px-4 py-3 space-y-1">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'branches', 'settings'].map((tab) => (
              <button
                key={tab}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setShowMobileMenu(false);
                }}
              >
                <span className="mr-3">
                  {tab === 'overview'
                    ? '📊'
                    : tab === 'sales'
                    ? '💰'
                    : tab === 'inventory'
                    ? '📦'
                    : tab === 'employees'
                    ? '👥'
                    : tab === 'reports'
                    ? '📋'
                    : tab === 'branches'
                    ? '🏪'
                    : '⚙️'}
                </span>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-6 overflow-x-auto">
          <nav className="flex space-x-1 p-2">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'branches', 'settings'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <span>
                  {tab === 'overview'
                    ? '📊'
                    : tab === 'sales'
                    ? '💰'
                    : tab === 'inventory'
                    ? '📦'
                    : tab === 'employees'
                    ? '👥'
                    : tab === 'reports'
                    ? '📋'
                    : tab === 'branches'
                    ? '🏪'
                    : '⚙️'}
                </span>
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Branch Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`bg-gradient-to-br ${branch.color} text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                    selectedBranch === branch.id ? 'ring-4 ring-white/30' : ''
                  }`}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-3xl mb-2">
                        {branch.type === 'Electronics' ? '💻' : branch.type === 'Clothing' ? '👕' : '☕'}
                      </div>
                      <h3 className="text-xl font-bold">{branch.name}</h3>
                      <p className="text-white/90 text-sm">{branch.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${(branch.revenue / 1000).toFixed(0)}K</div>
                      <div className={`text-sm ${branch.growth > 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {branch.growth > 0 ? '↗' : '↘'} {branch.growth}%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBranch(branch);
                    }}
                    className="mt-4 text-sm text-white/80 hover:text-white underline"
                  >
                    Edit
                  </button>
                </div>
              ))}
              <div
                className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
                onClick={() => navigate('/add-branch')}
              >
                <div className="text-4xl mb-2">+</div>
                <h3 className="text-lg font-semibold">Add New Branch</h3>
                <p className="text-sm">Expand your business</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div
                        className={`flex items-center mt-2 text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        <span className="mr-1">{getTrendIcon(stat.trend)}</span>
                        {stat.change}
                      </div>
                    </div>
                    <div className={`text-3xl p-3 rounded-xl ${stat.color} bg-opacity-10`}>{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">📈</span> Sales Performance ({currentBranch?.name || 'Main Store'})
                </h3>
                <div className="h-80">
                  <Bar data={currentSalesData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">📦</span> Inventory Overview ({currentBranch?.name || 'Main Store'})
                </h3>
                <div className="h-80">
                  <Doughnut data={currentInventoryData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className="mr-2">🚀</span> Revenue Trends Across Branches
              </h3>
              <div className="h-80">
                <Line data={revenueTrendData} options={chartOptions} />
              </div>
            </div>

            {/* Quick Actions & Employees */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">⚡</span> Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: '➕', label: 'Add Product', action: () => navigate('/add-product') },
                    { icon: '📊', label: 'View Reports', action: () => setActiveTab('reports') },
                    { icon: '👥', label: 'Manage Staff', action: () => setActiveTab('employees') },
                    { icon: '📦', label: 'Inventory', action: () => setActiveTab('inventory') },
                    { icon: '💰', label: 'Sales', action: () => setActiveTab('sales') },
                    { icon: '🏪', label: 'Branches', action: () => setActiveTab('branches') },
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 p-4 rounded-xl text-center transition-all duration-200 transform hover:scale-105 border border-indigo-100"
                    >
                      <div className="text-2xl mb-2">{action.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{action.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-2">⭐</span> Top Performers
                  </span>
                  <button
                    onClick={() => setActiveTab('employees')}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View All
                  </button>
                </h3>
                <div className="space-y-4">
                  {currentEmployees.slice(0, 3).map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{employee.avatar}</div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-600">{employee.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">{employee.performance}%</div>
                        <div className="text-xs text-gray-500">{employee.sales} sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🔔</span> Recent Notifications
                </h3>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`text-lg mt-1 ${
                            notification.type === 'warning'
                              ? 'text-amber-500'
                              : notification.type === 'success'
                              ? 'text-green-500'
                              : 'text-blue-500'
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <p className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-green-500 transition-colors"
                          title="Mark as read"
                        >
                          <span className="text-lg">✓</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-3">
          <div className="flex justify-around">
            {['overview', 'sales', 'inventory', 'branches'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  activeTab === tab ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500'
                }`}
              >
                <span className="text-xl">
                  {tab === 'overview' ? '📊' : tab === 'sales' ? '💰' : tab === 'inventory' ? '📦' : '🏪'}
                </span>
                <span className="text-xs mt-1">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Branch Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="mr-2">✏️</span> Edit Branch
              </h2>
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <input
                      type="text"
                      name="type"
                      value={editForm.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDashboard;