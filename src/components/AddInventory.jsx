import React, { useState } from 'react';

const AddItem = () => {
  // State for form fields
  const [item, setItem] = useState({
    name: '',
    quantity: '',
    price: '',
    category: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the item data to an API or backend
    console.log('Item added:', item);
    // Reset form after submission
    setItem({
      name: '',
      quantity: '',
      price: '',
      category: ''
    });
    alert('Item added to inventory!');
  };

  return (
    <div className="max-w-lg mx-auto my-4 sm:my-6 md:my-8 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Add Item to Inventory</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Item Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={item.name}
            onChange={handleChange}
            required
            placeholder="Enter item name"
            className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="quantity" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={item.quantity}
            onChange={handleChange}
            required
            min="1"
            placeholder="Enter quantity"
            className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="price" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Price (USD):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={item.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter price"
            className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="category" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Category:</label>
          <select
            id="category"
            name="category"
            value={item.category}
            onChange={handleChange}
            required
            className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="" disabled>Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base mt-2 sm:mt-4"
        >
          Add Item
        </button>
      </form>
    </div>
  );
};

export default AddItem;