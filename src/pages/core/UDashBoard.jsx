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
    <div className="max-w-7xl mx-auto my-2 sm:my-4 md:my-6 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-800">
        Staff Dashboard
      </h1>

      {/* Metrics Overview - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 md:p-6 text-center">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
            Today's Revenue
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{todayRevenue}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 md:p-6 text-center">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
            Today's Orders
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{todayOrders}</p>
        </div>
      </div>

      {/* Quick Actions - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <button
          onClick={() => navigate('/point-of-sale')}
          className="bg-green-500 text-white py-2 sm:py-3 px-4 rounded-md text-xs sm:text-sm md:text-base"
        >
          Go to POS
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-md text-xs sm:text-sm md:text-base"
        >
          View Full Sales Report
        </button>
        <button
          onClick={() => navigate('/sales')}
          className="bg-purple-500 text-white py-2 sm:py-3 px-4 rounded-md text-xs sm:text-sm md:text-base"
        >
          View Sales
        </button>
        <button
          onClick={() => navigate('/products')}
          className="bg-orange-500 text-white py-2 sm:py-3 px-4 rounded-md text-xs sm:text-sm md:text-base"
        >
          Browse Products
        </button>
      </div>

      {/* Recent Sales Section */}
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
        Recent Sales
      </h2>
      <div className="overflow-x-auto mb-4 sm:mb-6 md:mb-8">
        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg text-xs sm:text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600 border-b">
                ID
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600 border-b">
                Customer
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600 border-b">
                Amount
              </th>
              <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600 border-b">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id} className="border-b">
                <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-900">{sale.id}</td>
                <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-900">{sale.customer}</td>
                <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-900">{sale.amount}</td>
                <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-900">{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Need Help Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
          Need Help?
        </h2>
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-gray-600">
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a href="mailto:support@inventoryapp.com" className="text-blue-600 hover:underline">
              support@inventoryapp.com
            </a>
          </p>
          <p>
            <span className="font-semibold">Phone:</span>{' '}
            <a href="tel:+1234567890" className="text-blue-600 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
          <p>
            <span className="font-semibold">Support Portal:</span>{' '}
            <button
              onClick={() => navigate('/support')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Visit our FAQ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;