import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    cost_price: '',
    selling_price: '',
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
      cost_price: '',
      selling_price: '',
      quantity: '',
      category: '',
      image: '',
    });
  };

  // Category options
  const categories = ['Electronics', 'Clothing', 'Books', 'Groceries', 'Home Appliances'];

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center md:text-left tracking-tight">
        Add New Product
      </h1>

      {/* Add Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 max-w-lg mx-auto space-y-6"
      >
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            required
            aria-required="true"
            placeholder="Enter product name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            rows="4"
            placeholder="Enter product description"
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price per Unit ($)</label>
          <input
            type="number"
            name="cost_price"
            value={product.cost_price}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            step="0.01"
            min="0"
            required
            aria-required="true"
            placeholder="Enter cost price"
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price per Unit ($)</label>
          <input
            type="number"
            name="selling_price"
            value={product.selling_price}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            step="0.01"
            min="0"
            required
            aria-required="true"
            placeholder="Enter selling price"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            min="0"
            required
            aria-required="true"
            placeholder="Enter quantity"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            required
            aria-required="true"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            name="image"
            value={product.image}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter image URL"
          />
        </div>

        {/* Image Preview */}
        {product.image && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
            <img
              src={product.image}
              alt="Product Preview"
              className="w-32 h-32 object-cover rounded-lg shadow-sm mx-auto"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image')}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 md:w-auto"
          >
            Back to Products
          </button>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 md:w-auto"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;