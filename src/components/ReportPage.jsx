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
  { id: 2, type: 'Inventory', period: 'Q2 2023', revenue: null, expenses: null, profit: null },
  { id: 3, type: 'Sales', period: 'Q3 2023', revenue: 15000, expenses: 8000, profit: 7000 },
  { id: 4, type: 'Customer', period: 'Q4 2023', revenue: null, expenses: null, profit: null },
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
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: salesData.map((report) => report.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Profit',
        data: salesData.map((report) => report.profit),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Prepare data for Inventory Pie Chart
  const inventoryData = reportsData.filter((report) => report.type === 'Inventory');
  const inventoryChartData = {
    labels: inventoryData.map((report) => report.period),
    datasets: [
      {
        label: 'Inventory Reports',
        data: inventoryData.map((_, index) => index + 1), // Dummy data for count
        backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Reports Dashboard</h1>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Sales Reports</h2>
          <p className="text-2xl font-bold">{salesData.length}</p>
          <p className="text-sm text-gray-600">Across all periods</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Inventory Reports</h2>
          <p className="text-2xl font-bold">{inventoryData.length}</p>
          <p className="text-sm text-gray-600">Across all periods</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
          <p className="text-2xl font-bold">
            ${salesData.reduce((sum, report) => sum + (report.revenue || 0), 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">From sales reports</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Sales Performance</h2>
          <div className="h-64">
            <Bar data={salesChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inventory Reports Distribution</h2>
          <div className="h-64">
            <Pie data={inventoryChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Period</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Revenue</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Expenses</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Profit</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportsData.map((report) => (
              <tr key={report.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-sm text-gray-900">{report.id}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-900">{report.type}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-900">{report.period}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-900 hidden sm:table-cell">
                  {report.revenue !== null ? `$${report.revenue.toFixed(2)}` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-900 hidden sm:table-cell">
                  {report.expenses !== null ? `$${report.expenses.toFixed(2)}` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-900 hidden sm:table-cell">
                  {report.profit !== null ? `$${report.profit.toFixed(2)}` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b text-sm flex flex-col sm:flex-row gap-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs">View</button>
                  <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Report Button */}
      <div className="mt-6 flex justify-center">
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">Generate New Report</button>
      </div>
    </div>
  );
};

export default Reports;