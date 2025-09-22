import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState('all'); // State for location selection
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    locations: [
      { id: 1, name: 'Downtown Store', revenue: 150000000, orders: 1245, lowStock: 5, employees: 10 },
      { id: 2, name: 'Uptown Store', revenue: 200000000, orders: 1800, lowStock: 3, employees: 8 },
      { id: 3, name: 'Mall Outlet', revenue: 100000000, orders: 900, lowStock: 7, employees: 7 },
    ],
    notifications: [
      { id: 1, location: 'Downtown Store', message: 'Low stock alert: Laptops (10 units)', time: '10 mins ago', read: false },
      { id: 2, location: 'all', message: 'Sales report generated for Q3', time: '1 hour ago', read: false },
      { id: 3, location: 'Uptown Store', message: 'New employee onboarded', time: '2 hours ago', read: true },
    ],
    employees: [
      { id: 1, location: 'Downtown Store', name: 'Alex Johnson', role: 'Store Manager', status: 'Active', performance: '92%', avatar: '👨🏼‍💼' },
      { id: 2, location: 'Uptown Store', name: 'Maria Garcia', role: 'Sales Associate', status: 'Active', performance: '85%', avatar: '👩🏽‍💼' },
      { id: 3, location: 'Mall Outlet', name: 'James Wilson', role: 'Inventory Manager', status: 'On Leave', performance: '78%', avatar: '👨🏽‍💼' },
      { id: 4, location: 'Downtown Store', name: 'Sarah Chen', role: 'Accountant', status: 'Active', performance: '95%', avatar: '👩🏻‍💼' },
    ],
    salesData: {
      'all': {
        labels: ['Q1 2025', 'Q2 2025', 'Q3 2025'],
        datasets: [
          { label: 'Revenue (UGX)', data: [450000000, 550000000, 600000000], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
          { label: 'Expenses (UGX)', data: [250000000, 300000000, 320000000], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
        ],
      },
      'Downtown Store': {
        labels: ['Q1 2025', 'Q2 2025', 'Q3 2025'],
        datasets: [
          { label: 'Revenue (UGX)', data: [150000000, 180000000, 200000000], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
          { label: 'Expenses (UGX)', data: [80000000, 90000000, 95000000], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
        ],
      },
      'Uptown Store': {
        labels: ['Q1 2025', 'Q2 2025', 'Q3 2025'],
        datasets: [
          { label: 'Revenue (UGX)', data: [200000000, 220000000, 250000000], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
          { label: 'Expenses (UGX)', data: [110000000, 120000000, 130000000], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
        ],
      },
      'Mall Outlet': {
        labels: ['Q1 2025', 'Q2 2025', 'Q3 2025'],
        datasets: [
          { label: 'Revenue (UGX)', data: [100000000, 110000000, 120000000], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
          { label: 'Expenses (UGX)', data: [60000000, 65000000, 70000000], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
        ],
      },
    },
    inventoryData: {
      'all': {
        labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
        datasets: [
          { label: 'Stock Quantity', data: [22, 450, 120, 18], backgroundColor: 'rgba(153, 102, 255, 0.6)' },
        ],
      },
      'Downtown Store': {
        labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
        datasets: [
          { label: 'Stock Quantity', data: [10, 200, 50, 5], backgroundColor: 'rgba(153, 102, 255, 0.6)' },
        ],
      },
      'Uptown Store': {
        labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
        datasets: [
          { label: 'Stock Quantity', data: [7, 150, 40, 8], backgroundColor: 'rgba(153, 102, 255, 0.6)' },
        ],
      },
      'Mall Outlet': {
        labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
        datasets: [
          { label: 'Stock Quantity', data: [5, 100, 30, 5], backgroundColor: 'rgba(153, 102, 255, 0.6)' },
        ],
      },
    },
  });

  // Simulate fetching data from an API
  useEffect(() => {
    // Replace with actual API call to fetch locations, notifications, employees, and chart data
    // Example: fetch('/api/dashboard').then(res => res.json()).then(data => setDashboardData(data));
  }, []);

  // Mark notification as read
  const markAsRead = (id) => {
    setDashboardData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
  };

  // Compute aggregated metrics
  const aggregatedMetrics = {
    revenue: dashboardData.locations.reduce((sum, loc) => sum + loc.revenue, 0),
    orders: dashboardData.locations.reduce((sum, loc) => sum + loc.orders, 0),
    lowStock: dashboardData.locations.reduce((sum, loc) => sum + loc.lowStock, 0),
    employees: dashboardData.locations.reduce((sum, loc) => sum + loc.employees, 0),
  };

  // Filter employees and notifications based on selected location
  const filteredEmployees = selectedLocation === 'all'
    ? dashboardData.employees
    : dashboardData.employees.filter((emp) => emp.location === selectedLocation);
  const filteredNotifications = selectedLocation === 'all'
    ? dashboardData.notifications
    : dashboardData.notifications.filter((notif) => notif.location === selectedLocation || notif.location === 'all');

  // Current metrics based on selected location
  const currentMetrics = selectedLocation === 'all'
    ? aggregatedMetrics
    : dashboardData.locations.find((loc) => loc.name === selectedLocation) || {};

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  // Format currency for UGX
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-3 text-gray-500"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Business Owner Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Location Selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Locations</option>
              {dashboardData.locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <i className="fas fa-bell text-xl"></i>
                {filteredNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {filteredNotifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            <div className="hidden md:flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                AD
              </div>
              <span className="ml-2 text-gray-700">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'settings'].map((tab) => (
              <button
                key={tab}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === tab
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setShowMobileMenu(false);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Tabs */}
        <div className="hidden md:block border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'settings'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: 'Total Revenue', value: formatCurrency(currentMetrics.revenue || 0), change: '+8%', icon: '💰', color: 'bg-green-500' },
                { title: 'Total Orders', value: currentMetrics.orders || 0, change: '+12%', icon: '🛒', color: 'bg-blue-500' },
                { title: 'Low Stock Items', value: currentMetrics.lowStock || 0, change: '+2', icon: '📦', color: 'bg-red-500' },
                { title: 'Active Employees', value: currentMetrics.employees || 0, change: '+1', icon: '👥', color: 'bg-purple-500' },
              ].map((stat, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-4 md:p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl`}>
                        {stat.icon}
                      </div>
                      <div className="ml-4 md:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-xl md:text-2xl font-semibold text-gray-900">{stat.value}</div>
                            <div className="ml-2 flex items-baseline text-xs md:text-sm font-semibold text-green-600">
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Sales Performance ({selectedLocation})</h3>
                <div className="h-64">
                  <Bar
                    data={dashboardData.salesData[selectedLocation] || dashboardData.salesData['all']}
                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: `Sales vs Expenses (${selectedLocation})` } } }}
                  />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Inventory Levels ({selectedLocation})</h3>
                <div className="h-64">
                  <Bar
                    data={dashboardData.inventoryData[selectedLocation] || dashboardData.inventoryData['all']}
                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: `Current Stock Levels (${selectedLocation})` } } }}
                  />
                </div>
              </div>
            </div>

            {/* Employees and Actions */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Management */}
              <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
                <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Employee Management</h3>
                  <button onClick={() => navigate('/employees')} className="text-sm text-indigo-600 hover:text-indigo-800">
                    View All
                  </button>
                </div>
                <ul className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <li key={employee.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 text-xl md:text-2xl">
                            {employee.avatar}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate">{employee.role} ({employee.location})</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {employee.status}
                          </span>
                          <div className="text-xs md:text-sm text-gray-500 mt-1">{employee.performance} Performance</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admin Actions */}
              <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
                <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Admin Actions</h3>
                </div>
                <div className="px-4 py-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <button
                      onClick={() => navigate('/locations')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <i className="fas fa-store mr-2"></i> Manage Locations
                    </button>
                    <button
                      onClick={() => navigate('/add_product')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <i className="fas fa-plus mr-2"></i> Add New Product
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <i className="fas fa-file-alt mr-2"></i> Generate Financial Report
                    </button>
                    <button
                      onClick={() => navigate('/employees')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <i className="fas fa-users mr-2"></i> Manage Employees
                    </button>
                    <button
                      onClick={() => navigate('/inventory')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <i className="fas fa-truck mr-2"></i> Update Inventory
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <i className="fas fa-cog mr-2"></i> Business Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="mt-6 md:mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {notification.message} {notification.location !== 'all' && `(${notification.location})`}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-4 bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">Mark as read</span>
                          <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Sales Tab Content */}
        {activeTab === 'sales' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Sales Overview ({selectedLocation})</h3>
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: 'Total Revenue', value: formatCurrency(currentMetrics.revenue || 0), change: '+8%', icon: '💰', color: 'bg-green-500' },
                { title: 'Total Orders', value: currentMetrics.orders || 0, change: '+12%', icon: '🛒', color: 'bg-blue-500' },
              ].map((stat, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-4 md:p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl`}>
                        {stat.icon}
                      </div>
                      <div className="ml-4 md:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-xl md:text-2xl font-semibold text-gray-900">{stat.value}</div>
                            <div className="ml-2 flex items-baseline text-xs md:text-sm font-semibold text-green-600">
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Sales Performance ({selectedLocation})</h3>
              <div className="h-64">
                <Bar
                  data={dashboardData.salesData[selectedLocation] || dashboardData.salesData['all']}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: `Sales vs Expenses (${selectedLocation})` } } }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Inventory Management ({selectedLocation})</h3>
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-md font-semibold mb-4">Current Stock Levels</h4>
              <div className="h-64">
                <Bar
                  data={dashboardData.inventoryData[selectedLocation] || dashboardData.inventoryData['all']}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: `Stock Levels (${selectedLocation})` } } }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab Content */}
        {activeTab === 'employees' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Employee Management ({selectedLocation})</h3>
            <ul className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <li key={employee.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 text-xl md:text-2xl">
                        {employee.avatar}
                      </div>
                      <div className="ml-3 md:ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                        <div className="text-xs md:text-sm text-gray-500 truncate">{employee.role} ({employee.location})</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">{employee.performance} Performance</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Reports ({selectedLocation})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/reports/sales')}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-chart-bar mr-2"></i> Sales Report
              </button>
              <button
                onClick={() => navigate('/reports/inventory')}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-boxes mr-2"></i> Inventory Report
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/settings/locations')}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-store mr-2"></i> Configure Locations
              </button>
              <button
                onClick={() => navigate('/settings/users')}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-users-cog mr-2"></i> User Permissions
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessOwnerDashboard;