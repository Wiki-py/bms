import React, { useState } from 'react';

// Mock data (replace with localStorage or other source if needed)
const mockItems = [
  { id: 1, name: 'Laptop', quantity: 3, price: 999.99, category: 'Electronics', created_at: '2025-09-01T10:00:00Z' },
  { id: 2, name: 'T-Shirt', quantity: 10, price: 19.99, category: 'Clothing', created_at: '2025-09-02T12:00:00Z' },
  { id: 3, name: 'Coffee', quantity: 0, price: 5.99, category: 'Food', created_at: '2025-09-03T14:00:00Z' },
  { id: 4, name: 'Chair', quantity: 2, price: 49.99, category: 'Furniture', created_at: '2025-09-04T16:00:00Z' },
];

const InventoryReport = () => {
  const [items] = useState(mockItems); // Use mock data for now

  // Calculate inventory value
  const inventoryValue = items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);

  // Filter low stock (quantity <= 5, but > 0) and out of stock (quantity = 0)
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 5);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  return (
    <div className="max-w-7xl mx-auto my-2 sm:my-4 md:my-6 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-800">
        Inventory Report
      </h1>

      {/* Inventory Value, Low Stock, and Out of Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Inventory Value Card */}
        <div className="bg-green-500 border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">Total Inventory Value</h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">${inventoryValue}</p>
        </div>

        {/* Low Stock Card */}
        <div className="bg-orange-500 border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">Low Stock Items</h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{lowStockItems.length}</p>
        </div>

        {/* Out of Stock Card */}
        <div className="bg-red-500 border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">Out of Stock Items</h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{outOfStockItems.length}</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Low Stock Alert Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-1 sm:p-4 md:p-6">
          <div className='flex justify-between items-center bg-orange-100 p-2 rounded mb-4'>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-yellow-700 mb-1 sm:mb-2">Low Stock Alerts</h2>
          </div>
          
          {lowStockItems.length > 0 ? (
            <ul className="list-disc pl-4 text-xs sm:text-sm md:text-base text-yellow-800">
              {lowStockItems.map(item => (
                <li key={item.id}>{item.name} (Qty: {item.quantity})</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm md:text-base text-yellow-800">No low stock items.</p>
          )}
        </div>

        {/* Out of Stock Alert Card */}
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <div className='flex justify-between items-center bg-red-100 p-2 rounded mb-4'>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-red-700 mb-1 sm:mb-2">Out of Stock Alerts</h2>
          </div>
          
          {outOfStockItems.length > 0 ? (
            <ul className="list-disc pl-4 text-xs sm:text-sm md:text-base text-red-800">
              {outOfStockItems.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm md:text-base text-red-800">No out of stock items.</p>
          )}
        </div>
      </div>

      {/* Inventory Summary Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Inventory Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs sm:text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Name</th>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Qty</th>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Price ($)</th>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Category</th>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Value ($)</th>
                <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left font-semibold text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{item.name}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{item.quantity}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{item.price.toFixed(2)}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{item.category}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{(item.quantity * item.price).toFixed(2)}</td>
                    <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;