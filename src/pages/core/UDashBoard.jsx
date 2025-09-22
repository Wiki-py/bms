import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState({
    name: 'Jane Smith',
    role: 'Cashier',
    location: 'Downtown Store',
    todayRevenue: 1250000, // UGX
    todayOrders: 15,
    recentSales: [
      { id: 1, customer: 'John Doe', amount: 150000, date: '2025-09-22' },
      { id: 2, customer: 'Alice Brown', amount: 200000, date: '2025-09-22' },
      { id: 3, customer: 'Bob Johnson', amount: 100000, date: '2025-09-21' },
      { id: 4, customer: 'Sarah Chen', amount: 300000, date: '2025-09-21' },
    ],
  });

  // Sample support contact info
  const supportInfo = {
    email: 'support@inventoryapp.com',
    phone: '+256 123 456 7890', // Uganda phone format
    portal: '/support',
  };

  // Simulate fetching staff and location-specific data from an API
  useEffect(() => {
    // Replace with actual API call
    // fetch(`/api/staff/${staffId}/dashboard?location=${staffData.location}`)
    //   .then(res => res.json())
    //   .then(data => setStaffData(data));
  }, []);

  // Format currency for UGX
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 text-center sm:text-left">
            Staff Dashboard - {staffData.location}
          </h1>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 sm:mt-0 bg-teal-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
          >
            My Profile
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Today's Revenue
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-teal-600">
              {formatCurrency(staffData.todayRevenue)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Today's Orders
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600">{staffData.todayOrders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/point-of-sale')}
            className="bg-teal-500 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-teal-600 transition-colors duration-200 shadow-md"
          >
            Go to POS
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="bg-indigo-500 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-600 transition-colors duration-200 shadow-md"
          >
            View Sales Report
          </button>
          <button
            onClick={() => navigate('/sales')}
            className="bg-purple-500 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-600 transition-colors duration-200 shadow-md"
          >
            View Sales
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-amber-500 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-amber-600 transition-colors duration-200 shadow-md"
          >
            Browse Products
          </button>
        </div>

        {/* Recent Sales Section */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-800 mb-4">
            Recent Sales
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base">
              <thead className="bg-teal-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                    ID
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                    Customer
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                    Amount
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffData.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-200 hover:bg-teal-50 transition-colors duration-150">
                    <td className="px-3 sm:px-4 py-2 text-gray-900">{sale.id}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-900">{sale.customer}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-900">{formatCurrency(sale.amount)}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-900">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-800 mb-4">
            Need Help?
          </h2>
          <div className="flex flex-col gap-3 text-sm sm:text-base text-gray-600">
            <p>
              <span className="font-semibold text-teal-600">Email:</span>{' '}
              <a href={`mailto:${supportInfo.email}`} className="text-indigo-600 hover:underline">
                {supportInfo.email}
              </a>
            </p>
            <p>
              <span className="font-semibold text-teal-600">Phone:</span>{' '}
              <a href={`tel:${supportInfo.phone}`} className="text-indigo-600 hover:underline">
                {supportInfo.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold text-teal-600">Support Portal:</span>{' '}
              <button
                onClick={() => navigate(supportInfo.portal)}
                className="text-indigo-600 hover:underline focus:outline-none"
              >
                Visit our FAQ
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;