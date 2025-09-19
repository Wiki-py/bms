import React from 'react';

const InventoryPage = () => {
  // Sample inventory data
  const inventoryData = [
    { id: 1, name: 'Product A', quantity: 50, price: '$10.00', category: 'Electronics' },
    { id: 2, name: 'Product B', quantity: 30, price: '$15.00', category: 'Clothing' },
    { id: 3, name: 'Product C', quantity: 20, price: '$20.00', category: 'Books' },
    { id: 4, name: 'Product D', quantity: 100, price: '$5.00', category: 'Groceries' },
    { id: 5, name: 'Product E', quantity: 15, price: '$25.00', category: 'Electronics' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Inventory Management</h1>
      {/* Add new product button */}
      <button className='bg-blue-500 border round py-2 px-4 rounded-md hover:bg-blue-600 text-white md:w-auto space-x-4 items-center '>Add New Product</button>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search inventory..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Inventory Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {inventoryData.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow flex space-x-4 items-center">
            <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
            <p className="text-sm text-gray-600">ID: {item.id}</p>
            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            <p className="text-sm text-gray-600">Price: {item.price}</p>
            <p className="text-sm text-gray-600">Category: {item.category}</p>
          </div>
        ))}
      </div>
      
      {/* Add Item Button - Full width on mobile */}
      <div className="mt-4">
        <button className="w-full md:w-auto bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          Add New Item
        </button>
      </div>
    </div>
  );
};

export default InventoryPage;