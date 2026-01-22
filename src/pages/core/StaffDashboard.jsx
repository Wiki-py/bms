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
const API_BASE = 'https://bms-api-2.onrender.com/api';

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

  // Helper function to extract array from API response
  const extractArrayFromResponse = (responseData) => {
    console.log('🔍 Extracting array from:', responseData);
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData.results)) {
        return responseData.results;
      }
      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
    }
    console.warn('⚠️ Unexpected response format, returning empty array');
    return [];
  };

  // Helper function to determine branch type
  const determineBranchType = (branch) => {
    if (branch.type) return branch.type;
    
    const name = branch.name?.toLowerCase() || '';
    if (name.includes('electronic') || name.includes('tech') || name.includes('computer')) {
      return 'Electronics';
    }
    if (name.includes('clothing') || name.includes('fashion') || name.includes('apparel')) {
      return 'Clothing';
    }
    if (name.includes('cafe') || name.includes('restaurant') || name.includes('food') || name.includes('coffee')) {
      return 'Food';
    }
    return 'General';
  };

  // Helper function to get branch color
  const getBranchColor = (type) => {
    switch (type) {
      case 'Electronics': return 'from-emerald-400 to-teal-500';
      case 'Clothing': return 'from-purple-400 to-pink-500';
      case 'Food': return 'from-orange-400 to-red-500';
      default: return 'from-blue-400 to-indigo-500';
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const instance = getAxiosInstance();
        if (!instance) {
          setLoading(false);
          return;
        }

        console.log('🔄 Starting data fetch...');

        // Fetch branches with proper error handling
        let fetchedBranches = [];
        try {
          console.log('🏪 Fetching branches...');
          const branchesRes = await instance.get('/branches/');
          console.log('📊 Raw branches response:', branchesRes.data);
          
          const branchesArray = extractArrayFromResponse(branchesRes.data);
          console.log('✅ Extracted branches array:', branchesArray);

          fetchedBranches = branchesArray.map((branch) => {
            const branchType = determineBranchType(branch);
            
            return {
              ...branch,
              type: branchType,
              color: getBranchColor(branchType),
              revenue: branch.revenue || 0,
              growth: branch.growth || 0,
            };
          });

          setBranches(fetchedBranches);
          setSelectedBranch(fetchedBranches[0]?.id || null);
          console.log('✅ Processed branches:', fetchedBranches);

        } catch (err) {
          console.error('❌ Error fetching branches:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
          });
          throw new Error(`Failed to fetch branches: ${err.message}`);
        }

        // Fetch notifications with proper error handling
        try {
          console.log('🔔 Fetching notifications...');
          const notificationsRes = await instance.get('/notifications/');
          console.log('📊 Raw notifications response:', notificationsRes.data);
          
          const notificationsArray = extractArrayFromResponse(notificationsRes.data);
          const processedNotifications = notificationsArray.map((notification) => ({
            ...notification,
            branch: notification.branch?.id || notification.branch,
          }));
          
          setNotifications(processedNotifications);
          console.log('✅ Processed notifications:', processedNotifications);
        } catch (err) {
          console.warn('⚠️ Error fetching notifications:', err.message);
          setNotifications([]);
        }

        // Fetch branch-specific data only if we have branches
        if (fetchedBranches.length > 0) {
          console.log('📈 Fetching branch-specific data...');
          const statsData = {};
          const employeesData = {};
          const salesDataMap = {};
          const inventoryDataMap = {};

          for (const branch of fetchedBranches) {
            try {
              console.log(`🔄 Fetching data for branch ${branch.id}...`);
              
              const [statsRes, employeesRes] = await Promise.all([
                instance.get(`/branches/${branch.id}/stats/`).catch((err) => {
                  console.warn(`⚠️ Stats fetch failed for branch ${branch.id}:`, err.message);
                  return { data: {} };
                }),
                instance.get(`/branches/${branch.id}/employees/`).catch((err) => {
                  console.warn(`⚠️ Employees fetch failed for branch ${branch.id}:`, err.message);
                  return { data: [] };
                }),
              ]);

              // Handle stats data
              statsData[branch.id] = statsRes.data || {};
              
              // Handle employees data
              const employeesArray = extractArrayFromResponse(employeesRes.data);
              employeesData[branch.id] = employeesArray;

              // Set default chart data
              salesDataMap[branch.id] = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Sales',
                    data: [65000, 59000, 80000, 81000, 56000, 55000],
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                  },
                ],
              };

              inventoryDataMap[branch.id] = {
                labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                datasets: [
                  {
                    label: 'Inventory Status',
                    data: [65, 25, 10],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(251, 191, 36, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                    ],
                  },
                ],
              };

            } catch (err) {
              console.error(`❌ Error fetching data for branch ${branch.id}:`, err.message);
            }
          }

          setStats(statsData);
          setEmployees(employeesData);
          setSalesData(salesDataMap);
          setInventoryData(inventoryDataMap);
        }

        console.log('✅ All data loaded successfully');

      } catch (err) {
        console.error('💥 Error fetching dashboard data:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        
        setError('Failed to load dashboard data. Using demo data.');
        
        // Set comprehensive fallback data
        setBranches([
          {
            id: 1,
            name: 'Main Electronics Store',
            type: 'Electronics',
            location: 'Downtown',
            color: 'from-emerald-400 to-teal-500',
            revenue: 150000,
            growth: 8.2,
          },
          {
            id: 2,
            name: 'Fashion Outlet',
            type: 'Clothing',
            location: 'City Mall',
            color: 'from-purple-400 to-pink-500',
            revenue: 80000,
            growth: 5.7,
          },
          {
            id: 3,
            name: 'Urban Cafe',
            type: 'Food',
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
            branch: 1,
            type: 'warning',
          },
          {
            id: 2,
            message: 'Sales report generated for Q3',
            time: '1 hour ago',
            read: false,
            branch: 2,
            type: 'info',
          },
          {
            id: 3,
            message: 'New employee onboarded',
            time: '2 hours ago',
            read: true,
            branch: 3,
            type: 'success',
          },
        ]);

        // Set fallback stats and chart data
        const fallbackStats = {
          1: { total_employees: 15, total_products: 120, total_sales: 150000, monthly_growth: 8.2 },
          2: { total_employees: 8, total_products: 85, total_sales: 80000, monthly_growth: 5.7 },
          3: { total_employees: 6, total_products: 45, total_sales: 45000, monthly_growth: 15.3 },
        };
        
        const fallbackEmployees = {
          1: [
            { id: 1, name: 'John Doe', role: 'Manager', performance: 95, sales: 45 },
            { id: 2, name: 'Jane Smith', role: 'Sales Associate', performance: 87, sales: 38 },
          ],
          2: [
            { id: 3, name: 'Mike Johnson', role: 'Store Manager', performance: 92, sales: 42 },
          ],
          3: [
            { id: 4, name: 'Sarah Wilson', role: 'Barista', performance: 88, sales: 35 },
          ],
        };

        setStats(fallbackStats);
        setEmployees(fallbackEmployees);
        
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
        index === 0 ? 'rgba(34, 197, 94, 1)' : 
        index === 1 ? 'rgba(168, 85, 247, 1)' : 
        'rgba(251, 191, 36, 1)',
      backgroundColor:
        index === 0 ? 'rgba(34, 197, 94, 0.1)' :
        index === 1 ? 'rgba(168, 85, 247, 0.1)' :
        'rgba(251, 191, 36, 0.1)',
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
      const updatedBranch = await instance.put(`/branches/${editingBranch.id}/`, editForm);
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
      case 'warning': return '⚠️';
      case 'success': return '🎉';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const currentBranch = branches.find((b) => b.id === selectedBranch) || branches[0] || {};
  const currentStats = stats[selectedBranch] || {};
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <span className="text-yellow-800">{error}</span>
            </div>
          </div>
        )}

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
                </div>
              ))}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentStats.total_employees !== undefined && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{currentStats.total_employees}</p>
                    </div>
                    <div className="text-3xl p-3 rounded-xl bg-blue-100 text-blue-600">👥</div>
                  </div>
                </div>
              )}
              {currentStats.total_products !== undefined && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{currentStats.total_products}</p>
                    </div>
                    <div className="text-3xl p-3 rounded-xl bg-green-100 text-green-600">📦</div>
                  </div>
                </div>
              )}
              {currentStats.total_sales !== undefined && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">${(currentStats.total_sales / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="text-3xl p-3 rounded-xl bg-purple-100 text-purple-600">💰</div>
                  </div>
                </div>
              )}
              {currentStats.monthly_growth !== undefined && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Monthly Growth</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{currentStats.monthly_growth}%</p>
                      <div className={`flex items-center mt-2 text-sm font-medium ${currentStats.monthly_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{currentStats.monthly_growth > 0 ? '📈' : '📉'}</span>
                        {currentStats.monthly_growth > 0 ? 'Growing' : 'Declining'}
                      </div>
                    </div>
                    <div className="text-3xl p-3 rounded-xl bg-orange-100 text-orange-600">📊</div>
                  </div>
                </div>
              )}
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

            {/* Rest of your existing JSX remains the same */}
            {/* ... */}
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessOwnerDashboard;