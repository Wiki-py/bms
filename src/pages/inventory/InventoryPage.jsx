import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Mock data (replace with localStorage or other source if needed)
const mockItems = [
  { id: 1, name: 'Laptop', quantity: 3, price: 999.99, category: 'Electronics', created_at: '2025-09-01T10:00:00Z' },
  { id: 2, name: 'T-Shirt', quantity: 10, price: 19.99, category: 'Clothing', created_at: '2025-09-02T12:00:00Z' },
  { id: 3, name: 'Coffee', quantity: 0, price: 5.99, category: 'Food', created_at: '2025-09-03T14:00:00Z' },
  { id: 4, name: 'Chair', quantity: 2, price: 49.99, category: 'Furniture', created_at: '2025-09-04T16:00:00Z' },
  { id: 5, name: 'Headphones', quantity: 8, price: 199.99, category: 'Electronics', created_at: '2025-09-05T09:00:00Z' },
  { id: 6, name: 'Jeans', quantity: 5, price: 59.99, category: 'Clothing', created_at: '2025-09-06T11:00:00Z' },
];

const InventoryReport = () => {
  const [items] = useState(mockItems); // Use mock data for now
  const currentDate = new Date('2025-09-22T00:00:00Z'); // Based on provided current date

  // Calculate inventory value
  const inventoryValue = items.reduce((total, item) => total + item.quantity * item.price, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // Filter low stock (quantity <= 5, but > 0) and out of stock (quantity = 0)
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 5);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  // Prepare data for Category Value Pie Chart
  const categoryValues = items.reduce((acc, item) => {
    const value = item.quantity * item.price;
    acc[item.category] = (acc[item.category] || 0) + value;
    return acc;
  }, {});
  const pieChartData = {
    labels: Object.keys(categoryValues),
    datasets: [
      {
        label: 'Inventory Value by Category',
        data: Object.values(categoryValues),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue for Electronics
          'rgba(34, 197, 94, 0.8)', // Green for Clothing
          'rgba(251, 191, 36, 0.8)', // Yellow for Food
          'rgba(168, 85, 247, 0.8)', // Violet for Furniture
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'text-red-600 font-bold';
    if (quantity <= 5) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const getRowClass = (quantity) => {
    if (quantity === 0) return 'bg-red-50 hover:bg-red-100';
    if (quantity <= 5) return 'bg-orange-50 hover:bg-orange-100';
    return 'bg-green-50 hover:bg-green-100';
  };

  const getDaysAgo = (createdAt) => {
    const createdDate = new Date(createdAt);
    const diffTime = currentDate - createdDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto my-2 sm:my-4 md:my-6 px-2 sm:px-4 md:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Inventory Report
        </h1>

        {/* Inventory Value, Low Stock, and Out of Stock Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
          {/* Inventory Value Card */}
          <div className="group bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Total Inventory Value</h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{inventoryValue}</p>
              </div>
              <div className="text-5xl opacity-75 group-hover:opacity-100 transition-opacity">💰</div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="group bg-gradient-to-br from-orange-400 to-red-500 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Low Stock Items</h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{lowStockItems.length}</p>
              </div>
              <div className="text-5xl opacity-75 group-hover:opacity-100 transition-opacity">⚠️</div>
            </div>
          </div>

          {/* Out of Stock Card */}
          <div className="group bg-gradient-to-br from-red-400 to-pink-500 text-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Out of Stock Items</h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{outOfStockItems.length}</p>
              </div>
              <div className="text-5xl opacity-75 group-hover:opacity-100 transition-opacity">🚫</div>
            </div>
          </div>
        </div>

        {/* Category Value Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-xl shadow-lg border border-white/20 mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 text-center">Inventory Value by Category</h2>
          <div className="h-64 sm:h-80 md:h-96 flex justify-center items-center">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
          {/* Low Stock Alert Card */}
          <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between bg-orange-100 p-3 rounded-lg mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-orange-700">Low Stock Alerts</h2>
              <div className="text-2xl">🔔</div>
            </div>
            {lowStockItems.length > 0 ? (
              <ul className="space-y-2 text-sm sm:text-base text-orange-800">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="text-orange-500">⚠️</span>
                    {item.name} (Qty: {item.quantity})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm sm:text-base text-orange-700 italic">No low stock items. Great job!</p>
            )}
          </div>

          {/* Out of Stock Alert Card */}
          <div className="group bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between bg-red-100 p-3 rounded-lg mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-red-700">Out of Stock Alerts</h2>
              <div className="text-2xl">🚨</div>
            </div>
            {outOfStockItems.length > 0 ? (
              <ul className="space-y-2 text-sm sm:text-base text-red-800">
                {outOfStockItems.map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm sm:text-base text-red-700 italic">No out of stock items. All good!</p>
            )}
          </div>
        </div>

        {/* Inventory Summary Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-50 to-gray-100">Inventory Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Value</th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length > 0 ? (
                  items.map(item => (
                    <tr key={item.id} className={`${getRowClass(item.quantity)} transition-colors duration-200 hover:bg-opacity-80`}>
                      <td className="px-4 sm:px-6 md:px-8 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className={`px-4 sm:px-6 md:px-8 py-4 ${getStockClass(item.quantity)}`}>
                        {item.quantity}
                      </td>
                      <td className="px-4 sm:px-6 md:px-8 py-4 text-gray-700">${item.price.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 md:px-8 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 md:px-8 py-4 text-gray-900 font-semibold">${(item.quantity * item.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                      <td className="px-4 sm:px-6 md:px-8 py-4 text-gray-500 text-sm">{getDaysAgo(item.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 sm:px-6 md:px-8 py-8 text-center text-gray-500 text-lg">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold flex items-center gap-2">
            <span>📊</span> Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;