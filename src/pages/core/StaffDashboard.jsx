import React, { useState } from 'react';
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
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Low stock alert: Laptops (10 units)', time: '10 mins ago', read: false },
    { id: 2, message: 'Sales report generated for Q3', time: '1 hour ago', read: false },
    { id: 3, message: 'New employee onboarded', time: '2 hours ago', read: true },
  ]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Sample data for business metrics
  const stats = [
    { title: 'Total Revenue', value: '$150,000', change: '+8%', icon: '💰', color: 'bg-green-500' },
    { title: 'Total Orders', value: '1,245', change: '+12%', icon: '🛒', color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: '5', change: '+2', icon: '📦', color: 'bg-red-500' },
    { title: 'Active Employees', value: '25', change: '+1', icon: '👥', color: 'bg-purple-500' },
  ];

  //Sample data for sales metrics
  const sales_stats = [
    { title: 'Total Sales', value: 'UGX 150,000', change: '+8%', icon: '💰', color: 'bg-green-500'},
    { title: 'Total Profits', value: 'UGX 1,245', change: '+12%', icon: '🛒', color: 'bg-blue-500' },

  ]

  // Sample employee data
  const employees = [
    { id: 1, name: 'Alex Johnson', role: 'Store Manager', status: 'Active', performance: '92%', avatar: '👨🏼‍💼' },
    { id: 2, name: 'Maria Garcia', role: 'Sales Associate', status: 'Active', performance: '85%', avatar: '👩🏽‍💼' },
    { id: 3, name: 'James Wilson', role: 'Inventory Manager', status: 'On Leave', performance: '78%', avatar: '👨🏽‍💼' },
    { id: 4, name: 'Sarah Chen', role: 'Accountant', status: 'Active', performance: '95%', avatar: '👩🏻‍💼' },
  ];

  // Sample sales data for chart
  const salesData = {
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [50000, 60000, 75000, 65000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses ($)',
        data: [30000, 35000, 40000, 38000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Sample inventory data for chart
  const inventoryData = {
    labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
    datasets: [
      {
        label: 'Stock Quantity',
        data: [10, 200, 50, 5],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
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
            <div className="relative">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <i className="fas fa-bell text-xl"></i>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
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
              {stats.map((stat, index) => (
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
                <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
                <div className="h-64">
                  <Bar data={salesData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Sales vs Expenses' } } }} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Inventory Levels</h3>
                <div className="h-64">
                  <Bar data={inventoryData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Current Stock Levels' } } }} />
                </div>
              </div>
            </div>

            {/* Employees and Actions */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Management */}
              <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-1">
                <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Employee Management</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                </div>
                <ul className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <li key={employee.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 text-xl md:text-2xl">
                            {employee.avatar}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate">{employee.role}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                            employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
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
                    <button onClick={() =>navigate('/add_product')}className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      <i className="fas fa-plus mr-2"></i> Add New Product
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      <i className="fas fa-file-alt mr-2"></i> Generate Financial Report
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      <i className="fas fa-users mr-2"></i> Manage Employees
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      <i className="fas fa-truck mr-2"></i> Update Inventory
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      <i className="fas fa-cog mr-2"></i> Business Settings
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                      <i className="fas fa-chart-line mr-2"></i> View Analytics
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
                {notifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {notification.message}
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

        {/* Placeholder for Other Tabs */}
        {activeTab === 'sales' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
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
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
                <div className="h-64">
                  <Bar data={salesData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Sales vs Expenses' } } }} />
                </div>
              </div>
          </div>
        )}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            <p className="text-sm text-gray-600">Inventory details and controls will be displayed here.</p>
          </div>
        )}
        {activeTab === 'employees' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Employee Management</h3>
            <p className="text-sm text-gray-600">Employee details and management tools will be displayed here.</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Reports</h3>
            <p className="text-sm text-gray-600">Business reports and analytics will be displayed here.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-sm text-gray-600">Business and user settings will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessOwnerDashboard;