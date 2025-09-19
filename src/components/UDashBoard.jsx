import React from 'react';
import { useNavigate } from 'react-router-dom';
const StaffDashboard = () => {
  const navigate = useNavigate();
  // Sample data for dashboard metrics
  const todayRevenue = '$1,250.00';
  const todayOrders = 15;
  const recentSales = [
    { id: 1, customer: 'John Doe', amount: '$150.00', date: '2023-10-01' },
    { id: 2, customer: 'Jane Smith', amount: '$200.00', date: '2023-10-01' },
    { id: 3, customer: 'Bob Johnson', amount: '$100.00', date: '2023-10-01' },
    { id: 4, customer: 'Alice Brown', amount: '$300.00', date: '2023-09-30' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Staff Dashboard</h1>
      
      {/* Metrics Overview - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Today's Revenue</h2>
          <p className="text-2xl font-bold text-green-600">{todayRevenue}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Today's Orders</h2>
          <p className="text-2xl font-bold text-blue-600">{todayOrders}</p>
        </div>
      </div>
      
      {/* Action Buttons - Responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={() => navigate('/point-of-sale')} className="bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors text-center">
          Go to POS
        </button>
        <button onClick={() =>navigate('/reports')} className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors text-center">
          View Full Sales Report
        </button>
      </div>
      
      {/* Recent Sales Section */}
      <h2 className="text-xl font-semibold mb-3">Recent Sales</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Customer</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Amount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900 border-b">{sale.id}</td>
                <td className="py-3 px-4 text-sm text-gray-900 border-b">{sale.customer}</td>
                <td className="py-3 px-4 text-sm text-gray-900 border-b">{sale.amount}</td>
                <td className="py-3 px-4 text-sm text-gray-900 border-b">{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;