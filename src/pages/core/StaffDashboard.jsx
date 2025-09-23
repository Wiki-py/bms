import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState('main'); // Default to main branch
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Low stock alert: Laptops (10 units) at Main Store', time: '10 mins ago', read: false, branch: 'main' },
    { id: 2, message: 'Sales report generated for Q3 at Outlet', time: '1 hour ago', read: false, branch: 'outlet' },
    { id: 3, message: 'New employee onboarded at Cafe', time: '2 hours ago', read: true, branch: 'cafe' },
  ]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', location: '' });

  // Branch definitions - now editable
  const [branches, setBranches] = useState([
    { id: 'main', name: 'Main Store', type: 'Electronics', location: 'Downtown', color: 'from-emerald-400 to-teal-500' },
    { id: 'outlet', name: 'Outlet', type: 'Clothing', location: 'Mall', color: 'from-cyan-400 to-blue-500' },
    { id: 'cafe', name: 'Cafe', type: 'Food & Beverages', location: 'Uptown', color: 'from-orange-400 to-red-500' },
  ]);

  // Branch stats, employees, sales, inventory data - update to use branches state if needed, but for now, keep as is
  const getBranchStats = (branchId) => {
    const statsMap = {
      main: [
        { title: 'Total Revenue', value: '$150,000', change: '+8%', icon: '💰', color: 'from-emerald-400 to-teal-500' },
        { title: 'Total Orders', value: '1,245', change: '+12%', icon: '🛒', color: 'from-cyan-400 to-blue-500' },
        { title: 'Low Stock Items', value: '5', change: '+2', icon: '📦', color: 'from-red-400 to-pink-500' },
        { title: 'Active Employees', value: '15', change: '+1', icon: '👥', color: 'from-violet-400 to-purple-500' },
      ],
      outlet: [
        { title: 'Total Revenue', value: '$80,000', change: '+5%', icon: '💰', color: 'from-emerald-400 to-teal-500' },
        { title: 'Total Orders', value: '890', change: '+7%', icon: '🛒', color: 'from-cyan-400 to-blue-500' },
        { title: 'Low Stock Items', value: '3', change: '0', icon: '📦', color: 'from-red-400 to-pink-500' },
        { title: 'Active Employees', value: '10', change: '0', icon: '👥', color: 'from-violet-400 to-purple-500' },
      ],
      cafe: [
        { title: 'Total Revenue', value: '$45,000', change: '+15%', icon: '💰', color: 'from-emerald-400 to-teal-500' },
        { title: 'Total Orders', value: '2,100', change: '+20%', icon: '🛒', color: 'from-cyan-400 to-blue-500' },
        { title: 'Low Stock Items', value: '2', change: '-1', icon: '📦', color: 'from-red-400 to-pink-500' },
        { title: 'Active Employees', value: '8', change: '+2', icon: '👥', color: 'from-violet-400 to-purple-500' },
      ],
    };
    return statsMap[branchId] || statsMap.main;
  };

  // Sample employee data per branch
  const getBranchEmployees = (branchId) => {
    const employeesMap = {
      main: [
        { id: 1, name: 'Alex Johnson', role: 'Store Manager', status: 'Active', performance: '92%', avatar: '👨🏼‍💼' },
        { id: 2, name: 'Maria Garcia', role: 'Sales Associate', status: 'Active', performance: '85%', avatar: '👩🏽‍💼' },
        { id: 3, name: 'James Wilson', role: 'Inventory Manager', status: 'On Leave', performance: '78%', avatar: '👨🏽‍💼' },
      ],
      outlet: [
        { id: 4, name: 'Sarah Chen', role: 'Floor Supervisor', status: 'Active', performance: '95%', avatar: '👩🏻‍💼' },
        { id: 5, name: 'David Lee', role: 'Sales Associate', status: 'Active', performance: '88%', avatar: '👨🏻‍💼' },
      ],
      cafe: [
        { id: 6, name: 'Emma Rodriguez', role: 'Barista Lead', status: 'Active', performance: '90%', avatar: '👩🏼‍💼' },
        { id: 7, name: 'Tom Baker', role: 'Cashier', status: 'Active', performance: '82%', avatar: '👨🏽‍💼' },
      ],
    };
    return employeesMap[branchId] || [];
  };

  // Sample sales data for chart per branch
  const getSalesData = (branchId) => {
    const salesMap = {
      main: {
        labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
        datasets: [
          {
            label: 'Revenue ($)',
            data: [50000, 60000, 75000, 65000],
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
          },
          {
            label: 'Expenses ($)',
            data: [30000, 35000, 40000, 38000],
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
          },
        ],
      },
      outlet: {
        labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
        datasets: [
          {
            label: 'Revenue ($)',
            data: [30000, 35000, 40000, 35000],
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
          },
          {
            label: 'Expenses ($)',
            data: [20000, 22000, 25000, 23000],
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
          },
        ],
      },
      cafe: {
        labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
        datasets: [
          {
            label: 'Revenue ($)',
            data: [15000, 20000, 25000, 20000],
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
          },
          {
            label: 'Expenses ($)',
            data: [10000, 12000, 15000, 13000],
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
          },
        ],
      },
    };
    return salesMap[branchId] || salesMap.main;
  };

  // Sample inventory data for chart per branch
  const getInventoryData = (branchId) => {
    const inventoryMap = {
      main: {
        labels: ['Laptops', 'Mice', 'Keyboards', 'Monitors'],
        datasets: [
          {
            label: 'Stock Quantity',
            data: [10, 200, 50, 5],
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
          },
        ],
      },
      outlet: {
        labels: ['T-Shirts', 'Jeans', 'Jackets', 'Shoes'],
        datasets: [
          {
            label: 'Stock Quantity',
            data: [50, 30, 20, 40],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
          },
        ],
      },
      cafe: {
        labels: ['Coffee', 'Pastries', 'Sandwiches', 'Juices'],
        datasets: [
          {
            label: 'Stock Quantity',
            data: [100, 25, 40, 60],
            backgroundColor: 'rgba(251, 191, 36, 0.6)',
          },
        ],
      },
    };
    return inventoryMap[branchId] || inventoryMap.main;
  };

  // Branch distribution for doughnut chart
  const branchDistributionData = {
    labels: branches.map(b => b.name),
    datasets: [
      {
        label: 'Revenue Share',
        data: [60, 25, 15], // Percentages for main, outlet, cafe
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
        borderWidth: 1,
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

  const currentBranch = branches.find(b => b.id === selectedBranch);
  const currentStats = getBranchStats(selectedBranch);
  const currentEmployees = getBranchEmployees(selectedBranch);
  const currentSalesData = getSalesData(selectedBranch);
  const currentInventoryData = getInventoryData(selectedBranch);

  // Handle edit branch
  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setEditForm({ name: branch.name, type: branch.type, location: branch.location });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingBranch) {
      setBranches(branches.map(b => 
        b.id === editingBranch.id 
          ? { ...b, name: editForm.name, type: editForm.type, location: editForm.location }
          : b
      ));
      if (selectedBranch === editingBranch.id) {
        setSelectedBranch(editingBranch.id); // Ensure selected remains valid
      }
      setShowEditModal(false);
      setEditingBranch(null);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-3 text-indigo-600 hover:text-indigo-800"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Business Owner Dashboard</h1>
          </div>
          {/* Branch Selector */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="appearance-none bg-white border border-indigo-300 rounded-lg px-4 py-2 text-sm font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.location})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            <div className="relative">
              <button className="p-2 rounded-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 transition-colors">
                <i className="fas fa-bell text-xl"></i>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center shadow-lg">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            <div className="hidden md:flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                AD
              </div>
              <span className="ml-2 text-gray-700 font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white/80 backdrop-blur-md shadow-md border-b border-indigo-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'settings', 'branches'].map((tab) => (
              <button
                key={tab}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
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
        <div className="hidden md:block border-b border-indigo-200 bg-white/50 backdrop-blur-sm rounded-t-lg">
          <nav className="-mb-px flex space-x-8 px-4">
            {['overview', 'sales', 'inventory', 'employees', 'reports', 'settings', 'branches'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 border-b-2 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-indigo-600 hover:border-indigo-300'
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
            {/* Branch Summary Cards */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              {branches.map((branch, index) => (
                <div
                  key={branch.id}
                  className={`group bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer ${branch.color}`}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <div className="p-4 md:p-5 bg-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white/90">{branch.type}</h4>
                        <p className="text-lg font-bold text-white">{branch.name}</p>
                        <p className="text-xs text-white/80">{branch.location}</p>
                      </div>
                      <div className={`text-3xl opacity-80 group-hover:opacity-100 transition-opacity ${branch.id === selectedBranch ? 'ring-2 ring-white/50' : ''}`}>
                        {branch.id === 'main' ? '🏪' : branch.id === 'outlet' ? '👕' : '☕'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Metrics for Selected Branch */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentBranch?.name} Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {currentStats.map((stat, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50 hover:shadow-xl transition-shadow">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl shadow-md`}>
                          {stat.icon}
                        </div>
                        <div className="ml-4 md:ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-xl md:text-2xl font-semibold text-gray-900">{stat.value}</div>
                              <div className={`ml-2 flex items-baseline text-xs md:text-sm font-semibold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
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
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Sales Performance ({currentBranch?.name})</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <Bar data={currentSalesData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Sales vs Expenses', font: { size: 16, weight: 'bold' }, color: '#4f46e5' } } }} />
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Inventory Levels ({currentBranch?.name})</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <Bar data={currentInventoryData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Current Stock Levels', font: { size: 16, weight: 'bold' }, color: '#7c3aed' } } }} />
                </div>
              </div>
            </div>

            {/* Overall Branch Distribution */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Revenue Distribution Across Branches</h3>
              <div className="h-64 flex justify-center items-center">
                <Doughnut data={branchDistributionData} options={chartOptions} />
              </div>
            </div>

            {/* Employees and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Employee Management for Selected Branch */}
              <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50 lg:col-span-1">
                <div className="px-4 py-4 sm:px-6 border-b border-indigo-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-lg font-medium text-gray-900">Employees ({currentBranch?.name})</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => setActiveTab('employees')}>View All</button>
                </div>
                <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {currentEmployees.slice(0, 3).map((employee) => (
                    <li key={employee.id} className="px-4 py-4 sm:px-6 hover:bg-indigo-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 text-xl md:text-2xl rounded-full bg-indigo-100 p-1">
                            {employee.avatar}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate">{employee.role}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            employee.status === 'On Leave' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                          <div className="text-xs md:text-sm text-gray-500 mt-1">{employee.performance} Performance</div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {currentEmployees.length > 3 && (
                    <li className="px-4 py-4 text-center text-sm text-gray-500">+{currentEmployees.length - 3} more</li>
                  )}
                </ul>
              </div>

              {/* Admin Actions */}
              <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50 lg:col-span-2">
                <div className="px-4 py-4 sm:px-6 border-b border-indigo-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <h3 className="text-lg font-medium text-gray-900">Admin Actions ({currentBranch?.name})</h3>
                </div>
                <div className="px-4 py-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <button
                      onClick={() => navigate(`/add_product?branch=${selectedBranch}`)}
                      className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      <i className="fas fa-plus mr-2"></i> Add Product
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-300 transition-all hover:shadow-md">
                      <i className="fas fa-file-alt mr-2"></i> Generate Report
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-emerald-300 transition-all hover:shadow-md">
                      <i className="fas fa-users mr-2"></i> Manage Employees
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-cyan-300 transition-all hover:shadow-md">
                      <i className="fas fa-truck mr-2"></i> Update Inventory
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-amber-300 transition-all hover:shadow-md">
                      <i className="fas fa-cog mr-2"></i> Branch Settings
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-pink-300 transition-all hover:shadow-md">
                      <i className="fas fa-chart-line mr-2"></i> View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Panel (filtered by branch or all) */}
            <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl border border-white/50">
              <div className="px-4 py-4 sm:px-6 border-b border-indigo-200 bg-gradient-to-r from-rose-50 to-red-50">
                <h3 className="text-lg font-medium text-gray-900">Notifications ({currentBranch?.name})</h3>
              </div>
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {notifications
                  .filter(n => n.branch === selectedBranch)
                  .map((notification) => (
                    <li key={notification.id} className={`px-4 py-4 sm:px-6 hover:bg-indigo-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-3 w-3 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-indigo-500 shadow-sm'}`}></div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-4 bg-white rounded-md inline-flex text-indigo-400 hover:text-indigo-500 focus:outline-none transition-colors"
                          >
                            <span className="sr-only">Mark as read</span>
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                {notifications.filter(n => n.branch === selectedBranch).length === 0 && (
                  <li className="px-4 py-4 text-center text-gray-500">No notifications for this branch.</li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Manage Branches</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className={`mb-4 p-3 rounded-lg ${branch.color} text-white text-center`}>
                    <div className="text-4xl mb-2">{branch.id === 'main' ? '🏪' : branch.id === 'outlet' ? '👕' : '☕'}</div>
                    <h4 className="font-bold">{branch.name}</h4>
                    <p className="text-sm">{branch.type}</p>
                    <p className="text-xs opacity-90">{branch.location}</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleEditBranch(branch)}
                      className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Edit Branch
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">Add Products</button>
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">View Reports</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button onClick={() => navigate('/add_branch')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">Add New Branch</button>
            </div>
          </div>
        )}

        {/* Other Tabs with Branch Context */}
        {activeTab === 'sales' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Sales Overview ({currentBranch?.name})</h3>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/70 p-4 rounded-xl shadow-lg border border-white/50">
                <h4 className="text-lg font-semibold mb-4">Sales Performance</h4>
                <div className="h-64">
                  <Bar data={currentSalesData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Sales vs Expenses' } } }} />
                </div>
              </div>
              <div className="bg-white/70 p-4 rounded-xl shadow-lg border border-white/50">
                <h4 className="text-lg font-semibold mb-4">Revenue Breakdown</h4>
                <div className="h-64">
                  <Doughnut data={branchDistributionData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'inventory' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Inventory Management ({currentBranch?.name})</h3>
            <div className="h-80">
              <Bar data={currentInventoryData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: `Stock Levels - ${currentBranch?.type}` } } }} />
            </div>
            <div className="mt-6">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all">Restock Items</button>
            </div>
          </div>
        )}
        {activeTab === 'employees' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Employee Management ({currentBranch?.name})</h3>
            <ul className="space-y-4">
              {currentEmployees.map((employee) => (
                <li key={employee.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl mr-4">
                      {employee.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {employee.status}
                    </span>
                    <p className="text-sm">{employee.performance}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all">Hire New Employee</button>
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Reports ({currentBranch?.name})</h3>
            <p className="text-gray-600 mb-6">Generate and view detailed reports for the selected branch.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600">Sales Report</button>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg hover:from-green-600 hover:to-emerald-600">Inventory Report</button>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg hover:from-blue-600 hover:to-cyan-600">Employee Report</button>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Settings</h3>
            <p className="text-gray-600 mb-6">Manage global business and user settings.</p>
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg hover:from-indigo-600 hover:to-purple-600">User Profile</button>
              <button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-gray-700">Billing</button>
              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-lg hover:from-red-600 hover:to-pink-600">Security</button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Branch Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Branch</h2>
              <form onSubmit={handleSaveEdit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={editForm.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all"
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