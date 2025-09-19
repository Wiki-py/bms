import React, { useState } from 'react';

const AddProductPage = () => {
  // Initial form state
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    image: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate adding product (e.g., API call)
    alert('Product added successfully!');
    // Reset form
    setProduct({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      image: '',
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Add New Product</h1>
      
      {/* Add Product Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-md rounded-lg p-6 max-w-lg mx-auto space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            required
          />
        </div>
        
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Groceries">Groceries</option>
          </select>
        </div>
        
        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            name="image"
            value={product.image}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;