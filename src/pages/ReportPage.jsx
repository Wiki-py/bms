import React from 'react';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const reportsData = [
  { id: 1, type: 'Sales', period: 'Q1 2023', revenue: 10000, expenses: 6000, profit: 4000 },
  { id: 2, type: 'Inventory', period: 'Q2 2023', revenue: null, expenses: null, profit: null, stockLevel: 250 },
  { id: 3, type: 'Sales', period: 'Q3 2023', revenue: 15000, expenses: 8000, profit: 7000 },
  { id: 4, type: 'Customer', period: 'Q4 2023', revenue: null, expenses: null, profit: null, satisfaction: 85 },
  { id: 5, type: 'Inventory', period: 'Q1 2024', revenue: null, expenses: null, profit: null, stockLevel: 180 },
];

const Reports = () => {
  // Prepare data for Sales Bar Chart
  const salesData = reportsData.filter((report) => report.type === 'Sales');
  const salesChartData = {
    labels: salesData.map((report) => report.period),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map((report) => report.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Emerald green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: salesData.map((report) => report.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: salesData.map((report) => report.profit),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Inventory Pie Chart (using stock levels for better representation)
  const inventoryData = reportsData.filter((report) => report.type === 'Inventory');
  const inventoryChartData = {
    labels: inventoryData.map((report) => `${report.period} Stock`),
    datasets: [
      {
        label: 'Stock Levels',
        data: inventoryData.map((report) => report.stockLevel || 0),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)', // Violet
          'rgba(236, 72, 153, 0.8)', // Pink
          'rgba(16, 185, 129, 0.8)', // Emerald
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Customer Pie Chart (added for completeness)
  const customerData = reportsData.filter((report) => report.type === 'Customer');
  const customerChartData = {
    labels: customerData.map((report) => `${report.period} Satisfaction`),
    datasets: [
      {
        data: customerData.map((report) => report.satisfaction || 0),
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)', // Orange
          'rgba(34, 197, 94, 0.8)', // Green
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
      title: {
        display: true,
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-8">
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Reports Dashboard
        </h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Sales Reports</h2>
                <p className="text-3xl font-bold">{salesData.length}</p>
                <p className="text-sm opacity-90">Across all periods</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">📈</div>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Inventory Reports</h2>
                <p className="text-3xl font-bold">{inventoryData.length}</p>
                <p className="text-sm opacity-90">Across all periods</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">📦</div>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
                <p className="text-3xl font-bold">
                  ${salesData.reduce((sum, report) => sum + (report.revenue || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm opacity-90">From sales reports</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">💰</div>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-purple-400 to-pink-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Customer Satisfaction</h2>
                <p className="text-3xl font-bold">{customerData.reduce((sum, report) => sum + (report.satisfaction || 0), 0)}%</p>
                <p className="text-sm opacity-90">Average score</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">😊</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Performance</h2>
            <div className="h-80">
              <Bar data={salesChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Inventory Stock Levels</h2>
            <div className="h-80">
              <Pie data={inventoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Additional Chart for Customer if data exists */}
        {customerData.length > 0 && (
          <div className="grid grid-cols-1 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 mx-auto max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Satisfaction Distribution</h2>
              <div className="h-64">
                <Pie data={customerChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Period</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Revenue</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Expenses</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Profit</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Extra Metric</th>
                  <th className="py-4 px-6 border-b text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportsData.map((report) => (
                  <tr
                    key={report.id}
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200 ${
                      report.type === 'Sales' ? 'bg-emerald-50' : report.type === 'Inventory' ? 'bg-blue-50' : 'bg-purple-50'
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{report.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.type === 'Sales'
                          ? 'bg-emerald-100 text-emerald-800'
                          : report.type === 'Inventory'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{report.period}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 hidden md:table-cell">
                      {report.revenue !== null ? `$${report.revenue.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">
                      {report.expenses !== null ? `$${report.expenses.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">
                      {report.profit !== null ? `$${report.profit.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 hidden xl:table-cell">
                      {report.stockLevel !== undefined ? `${report.stockLevel} units` : report.satisfaction !== undefined ? `${report.satisfaction}%` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition-colors duration-200 flex items-center gap-1">
                          <span>👁️</span> View
                        </button>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs transition-colors duration-200 flex items-center gap-1">
                          <span>⬇️</span> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="mt-8 flex justify-center">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold flex items-center gap-2">
            <span>✨</span> Generate New Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;