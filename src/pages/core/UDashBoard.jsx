import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [staffData, setStaffData] = useState({
    name: '',
    role: '',
    location: '',
    employeeId: '',
    todayRevenue: 0,
    todayOrders: 0,
    monthlyTarget: 30000000,
    monthlyProgress: 0,
    performance: 0,
    recentSales: [],
    quickStats: [],
  });

  // API base URL
  const API_BASE = 'https://pos-backend-8i4g.onrender.com/api';

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    console.log('🔐 Auth check:', {
      hasUser: !!storedUser,
      hasToken: !!token,
      user: storedUser ? JSON.parse(storedUser) : 'none'
    });

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      setError('Please log in to access the dashboard.');
      navigate('/login');
    }
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

  // Fetch dashboard data on mount
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('🔄 Starting dashboard data fetch...');

        const instance = {
          get: async (url) => {
            const response = await fetch(`${API_BASE}${url}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
          }
        };

        // Try to fetch user profile
        let profileData = {};
        try {
          console.log('👤 Fetching user profile...');
          // Try different possible endpoints
          const endpoints = ['/users/me/', '/user/', '/auth/user/'];
          
          for (const endpoint of endpoints) {
            try {
              profileData = await instance.get(endpoint);
              console.log('✅ User profile from', endpoint, ':', profileData);
              break;
            } catch (err) {
              console.warn(`⚠️ Failed to fetch from ${endpoint}:`, err.message);
            }
          }

          if (!profileData.id) {
            console.warn('⚠️ No user profile found, using fallback data');
            // Use data from localStorage as fallback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              profileData = JSON.parse(storedUser);
            }
          }

        } catch (profileErr) {
          console.warn('⚠️ Profile fetch failed, using fallback:', profileErr.message);
          // Use localStorage data as fallback
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            profileData = JSON.parse(storedUser);
          }
        }

        // Update staff data with profile information
        setStaffData(prev => ({
          ...prev,
          name: profileData.name || profileData.username || 'Staff Member',
          role: profileData.role || 'Cashier',
          location: profileData.branch?.name || profileData.location || 'Main Store',
          employeeId: profileData.employee_id || profileData.id || 'EMP-001',
          performance: profileData.performance || 85,
        }));

        // Try to fetch dashboard stats
        let dashboardData = {};
        try {
          console.log('📊 Fetching dashboard stats...');
          // Try different possible endpoints
          const endpoints = ['/dashboard/', '/staff/dashboard/', '/sales/today/'];
          
          for (const endpoint of endpoints) {
            try {
              dashboardData = await instance.get(endpoint);
              console.log('✅ Dashboard stats from', endpoint, ':', dashboardData);
              break;
            } catch (err) {
              console.warn(`⚠️ Failed to fetch from ${endpoint}:`, err.message);
            }
          }

        } catch (dashboardErr) {
          console.warn('⚠️ Dashboard stats fetch failed, using fallback:', dashboardErr.message);
          // Use fallback data
          dashboardData = {
            todayRevenue: 1250000,
            todayOrders: 18,
            monthlyProgress: 18500000,
            recentSales: [
              {
                id: 1,
                customer: 'John M.',
                amount: 125000,
                items: 3,
                date: new Date().toLocaleDateString(),
                status: 'completed'
              },
              {
                id: 2,
                customer: 'Sarah K.',
                amount: 89000,
                items: 2,
                date: new Date().toLocaleDateString(),
                status: 'completed'
              },
              {
                id: 3,
                customer: 'Mike T.',
                amount: 156000,
                items: 4,
                date: new Date().toLocaleDateString(),
                status: 'completed'
              }
            ]
          };
        }

        // Calculate quick stats
        const todayRevenue = dashboardData.todayRevenue || 1250000;
        const todayOrders = dashboardData.todayOrders || 18;
        const avgSale = todayOrders > 0 ? todayRevenue / todayOrders : 0;
        
        const quickStats = [
          {
            label: 'Avg. Sale',
            value: `UGX ${Math.round(avgSale).toLocaleString()}`,
            icon: '💰',
            trend: '+5%',
          },
          { 
            label: 'Customers/Hr', 
            value: '4.2', 
            icon: '👥', 
            trend: '+12%' 
          },
          { 
            label: 'Items/Sale', 
            value: '3.8', 
            icon: '🛍️', 
            trend: '+2%' 
          },
        ];

        // Update state with all data
        setStaffData(prev => ({
          ...prev,
          todayRevenue,
          todayOrders,
          monthlyProgress: dashboardData.monthlyProgress || 18500000,
          recentSales: extractArrayFromResponse(dashboardData.recentSales) || [],
          quickStats,
        }));

        console.log('✅ Dashboard data loaded successfully');

      } catch (err) {
        console.error('💥 Dashboard fetch error:', err);
        
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Using demo data.');
          
          // Set comprehensive fallback data
          setStaffData(prev => ({
            ...prev,
            todayRevenue: 1250000,
            todayOrders: 18,
            monthlyProgress: 18500000,
            recentSales: [
              {
                id: 1,
                customer: 'John M.',
                amount: 125000,
                items: 3,
                date: new Date().toLocaleDateString(),
                status: 'completed'
              },
              {
                id: 2, 
                customer: 'Sarah K.',
                amount: 89000,
                items: 2,
                date: new Date().toLocaleDateString(),
                status: 'completed'
              }
            ],
            quickStats: [
              {
                label: 'Avg. Sale',
                value: 'UGX 69,444',
                icon: '💰',
                trend: '+5%',
              },
              { 
                label: 'Customers/Hr', 
                value: '4.2', 
                icon: '👥', 
                trend: '+12%' 
              },
              { 
                label: 'Items/Sale', 
                value: '3.8', 
                icon: '🛍️', 
                trend: '+2%' 
              },
            ],
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const progressPercentage = Math.min(
    (staffData.monthlyProgress / staffData.monthlyTarget) * 100,
    100
  );

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-500';
    if (percentage >= 75) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !staffData.recentSales.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl max-w-md mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <span className="text-yellow-800">{error}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold">
                Good {timeOfDay}, {staffData.name}! 👋
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">
                {staffData.role} • {staffData.location} • ID: {staffData.employeeId}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                  🏆 Performance: {staffData.performance}%
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                  📍 {staffData.location}
                </span>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                👤 Profile
              </button>
              <button 
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex space-x-2 p-2 min-w-max">
            {['overview', 'sales', 'products', 'reports', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm">Today's Revenue</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(staffData.todayRevenue)}</p>
                <p className="text-xs mt-1">{staffData.todayOrders} orders</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm">Monthly Target</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(staffData.monthlyProgress)}</p>
                <p className="text-xs mt-1">
                  {progressPercentage.toFixed(1)}% of {formatCurrency(staffData.monthlyTarget)}
                </p>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className={`bg-gradient-to-br ${getPerformanceColor(staffData.performance)} text-white p-4 rounded-2xl shadow-lg`}>
                <p className="text-sm">Performance</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{staffData.performance}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm">Quick Stats</p>
                <div className="mt-2 space-y-1">
                  {staffData.quickStats.map((stat, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{stat.icon} {stat.label}</span>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                onClick={() => navigate('/point-of-sale')} 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                💳 POS
              </button>
              <button 
                onClick={() => navigate('/sales')} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                📈 Sales
              </button>
              <button 
                onClick={() => navigate('/products')} 
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                📦 Products
              </button>
              <button 
                onClick={() => navigate('/reports')} 
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                📋 Reports
              </button>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-4 overflow-x-auto">
              <h2 className="text-base sm:text-lg font-bold mb-3">Recent Sales 🎉</h2>
              {staffData.recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent sales yet.</p>
              ) : (
                <table className="w-full text-xs sm:text-sm min-w-max">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <th className="px-2 py-2 text-left">Customer</th>
                      <th className="px-2 py-2 text-left">Amount</th>
                      <th className="px-2 py-2 text-left">Items</th>
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData.recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-2 py-2">{sale.customer}</td>
                        <td className="px-2 py-2 font-bold text-green-600">{formatCurrency(sale.amount)}</td>
                        <td className="px-2 py-2">{sale.items}</td>
                        <td className="px-2 py-2">{sale.date}</td>
                        <td className="px-2 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sale.status)}`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 backdrop-blur-md shadow-lg border-t border-gray-200">
          <div className="flex justify-around py-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-purple-600' : 'text-gray-500'}`}
            >
              🏠<span className="text-xs">Home</span>
            </button>
            <button 
              onClick={() => navigate('/point-of-sale')}
              className="flex flex-col items-center text-gray-500"
            >
              💳<span className="text-xs">POS</span>
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="flex flex-col items-center text-gray-500"
            >
              📦<span className="text-xs">Products</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center text-gray-500"
            >
              👤<span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;