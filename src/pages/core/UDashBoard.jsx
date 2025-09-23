import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [staffData, setStaffData] = useState({
    name: 'Jane Smith',
    role: 'Cashier',
    location: 'Downtown Store',
    employeeId: 'EMP-2024-007',
    todayRevenue: 1250000,
    todayOrders: 15,
    monthlyTarget: 30000000,
    monthlyProgress: 18500000,
    performance: 92,
    recentSales: [
      { id: 1, customer: 'John Doe', amount: 150000, date: '2025-09-22', items: 3, status: 'completed' },
      { id: 2, customer: 'Alice Brown', amount: 200000, date: '2025-09-22', items: 5, status: 'completed' },
      { id: 3, customer: 'Bob Johnson', amount: 100000, date: '2025-09-21', items: 2, status: 'completed' },
      { id: 4, customer: 'Sarah Chen', amount: 300000, date: '2025-09-21', items: 7, status: 'completed' },
    ],
    quickStats: [
      { label: 'Avg. Sale', value: 'UGX 85,000', icon: '💰', trend: '+5%' },
      { label: 'Customers/Hr', value: '4.2', icon: '👥', trend: '+12%' },
      { label: 'Items/Sale', value: '3.8', icon: '🛍️', trend: '+2%' },
    ]
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const progressPercentage = Math.min((staffData.monthlyProgress / staffData.monthlyTarget) * 100, 100);

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-500';
    if (percentage >= 75) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

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
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm"
              >
                👤 Profile
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
              {/* Revenue */}
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm">Today's Revenue</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(staffData.todayRevenue)}</p>
                <p className="text-xs mt-1">{staffData.todayOrders} orders</p>
              </div>
              {/* Target */}
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm">Monthly Target</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(staffData.monthlyProgress)}</p>
                <p className="text-xs mt-1">
                  {progressPercentage.toFixed(1)}% of {formatCurrency(staffData.monthlyTarget)}
                </p>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
              {/* Performance */}
              <div className={`bg-gradient-to-br ${getPerformanceColor(staffData.performance)} text-white p-4 rounded-2xl shadow-lg`}>
                <p className="text-sm">Performance</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{staffData.performance}%</p>
              </div>
              {/* Quick Stats */}
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

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => navigate('/point-of-sale')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl">💳 POS</button>
              <button onClick={() => navigate('/sales')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl">📈 Sales</button>
              <button onClick={() => navigate('/products')} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-xl">📦 Products</button>
              <button onClick={() => navigate('/reports')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl">📋 Reports</button>
            </div>

            {/* Sales Table */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-4 overflow-x-auto">
              <h2 className="text-base sm:text-lg font-bold mb-3">Recent Sales 🎉</h2>
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
                    <tr key={sale.id} className="hover:bg-purple-50">
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
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 backdrop-blur-md shadow-lg">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center text-purple-600">🏠<span className="text-xs">Home</span></button>
            <button className="flex flex-col items-center text-gray-500">💳<span className="text-xs">POS</span></button>
            <button className="flex flex-col items-center text-gray-500">📦<span className="text-xs">Products</span></button>
            <button className="flex flex-col items-center text-gray-500">👤<span className="text-xs">Profile</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
