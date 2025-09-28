import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE = 'http://127.0.0.1:8000/api';

  // Fetch reports data on mount
  useEffect(() => {
    const fetchReports = async () => {
      let accessToken = localStorage.getItem('access');
      if (!accessToken) {
        alert('Please log in to view reports.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/reports/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched reports data:', data);  // Debug: Check this in console
          setReportsData(data || []);  // Fallback to []
        } else if (response.status === 401) {
          // Try refresh (as before)
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              accessToken = refreshData.access;
              localStorage.setItem('access', accessToken);
              // Retry
              const retryResponse = await fetch(`${API_BASE}/reports/`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              if (retryResponse.ok) {
                const data = await retryResponse.json();
                console.log('Refreshed and fetched:', data);
                setReportsData(data || []);
              } else {
                throw new Error('Retry failed');
              }
            } else {
              throw new Error('Session expired');
            }
          } else {
            throw new Error('Unauthorized');
          }
        } else {
          const errText = await response.text();  // Raw text for debug
          console.error('API Error Response:', errText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);  // Debug log
        setError(`Failed to load reports: ${err.message}`);
        if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  // Prepare data (with fallbacks)
  const salesData = reportsData.filter((report) => report.type === 'Sales') || [];
  const inventoryData = reportsData.filter((report) => report.type === 'Inventory') || [];
  const customerData = reportsData.filter((report) => report.type === 'Customer') || [];

  const salesChartData = salesData.length > 0 ? {
    labels: salesData.map((report) => report.period),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map((report) => report.revenue || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: salesData.map((report) => report.expenses || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: salesData.map((report) => report.profit || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const inventoryChartData = inventoryData.length > 0 ? {
    labels: inventoryData.map((report) => `${report.period} Stock`),
    datasets: [
      {
        label: 'Stock Levels',
        data: inventoryData.map((report) => report.stockLevel || 0),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const customerChartData = customerData.length > 0 ? {
    labels: customerData.map((report) => `${report.period} Satisfaction`),
    datasets: [
      {
        data: customerData.map((report) => report.satisfaction || 0),
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } },
      title: { display: true, font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Reports</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Debug log state
  console.log('Rendered with reportsData length:', reportsData.length, reportsData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-8">
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Reports Dashboard
        </h1>

        {/* Cards Section - Always show, with totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Sales Reports</h2>
                <p className="text-3xl font-bold">{salesData.length || 0}</p>
                <p className="text-sm opacity-90">Across all periods</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">📈</div>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Inventory Reports</h2>
                <p className="text-3xl font-bold">{inventoryData.length || 0}</p>
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
                <p className="text-3xl font-bold">
                  {customerData.reduce((sum, report) => sum + (report.satisfaction || 0), 0) || 0}%
                </p>
                <p className="text-sm opacity-90">Average score</p>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">😊</div>
            </div>
          </div>
        </div>

        {/* Charts Section - Conditional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Performance</h2>
            {salesChartData ? (
              <div className="h-80">
                <Bar data={salesChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Inventory Stock Levels</h2>
            {inventoryChartData ? (
              <div className="h-80">
                <Pie data={inventoryChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No inventory data available
              </div>
            )}
          </div>
        </div>

        {/* Customer Chart - Conditional */}
        {customerChartData ? (
          <div className="grid grid-cols-1 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 mx-auto max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer Satisfaction Distribution</h2>
              <div className="h-64">
                <Pie data={customerChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        ) : null}

        {/* Table Section - Always show, empty if no data */}
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
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      No reports data available yet. Create some sales or inventory to see results.
                    </td>
                  </tr>
                ) : (
                  reportsData.map((report) => (
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
                        {report.revenue !== null ? `$${Number(report.revenue).toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">
                        {report.expenses !== null ? `$${Number(report.expenses).toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">
                        {report.profit !== null ? `$${Number(report.profit).toLocaleString()}` : 'N/A'}
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
                  ))
                )}
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