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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!product.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!product.cost_price || parseFloat(product.cost_price) <= 0) {
      newErrors.cost_price = 'Valid cost price is required';
    }
    
    if (!product.selling_price || parseFloat(product.selling_price) <= 0) {
      newErrors.selling_price = 'Valid selling price is required';
    }
    
    if (!product.quantity || parseInt(product.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    if (!product.category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Implement token refresh (adjust endpoint if different)
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) return null;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {  // Your refresh endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
        return data.access;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    let accessToken = localStorage.getItem('access');
    if (!accessToken) {
      alert('Please log in to add products.');
      navigate('/login');
      return;
    }

    // Helper function to make the POST (for retry)
    const makePostRequest = async (token) => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/products/add', {  // Fixed: No /add/
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            cost_price: parseFloat(product.cost_price) || 0,
            selling_price: parseFloat(product.selling_price) || 0,
            quantity: parseInt(product.quantity) || 0,
            category: product.category,  // If FK, change to category ID, e.g., 1
            image: product.image,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message || 'Product added successfully!');  // Matches your backend response
          setProduct({
            name: '',
            description: '',
            cost_price: '',
            selling_price: '',
            quantity: '',
            category: '',
            image: '',
          });
          navigate('/products');
          return true;  // Success
        } else if (response.status === 401) {
          return 'unauthorized';  // Trigger refresh
        } else {
          const errorData = await response.json().catch(() => ({}));  // Fallback if not JSON
          console.error('API Error:', response.status, errorData);
          alert(`Error ${response.status}: ${errorData.detail || errorData.non_field_errors || 'Failed to add product'}`);
          return false;
        }
      } catch (error) {
        console.error('Network error:', error);
        throw error;  // Re-throw for outer catch
      }
    };

    try {
      let success = await makePostRequest(accessToken);
      if (success) return;

      // Handle 401: Refresh and retry
      if (success === 'unauthorized') {
        const newToken = await refreshAccessToken();
        if (newToken) {
          alert('Token refreshed—retrying...');
          success = await makePostRequest(newToken);
          if (success) return;
        } else {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/login');
          return;
        }
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to add product. Check your connection and ensure the server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  // Category options
  const categories = ['Electronics', 'Clothing', 'Books', 'Groceries', 'Home Appliances'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-2xl">📦</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Add New Product</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-medium">Back to Products</span>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                errors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
              }`}
              required
              aria-required="true"
              placeholder="Enter product name"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
              rows="4"
              placeholder="Enter product description"
              disabled={loading}
            />
          </div>

          {/* Cost Price */}
          <div className="space-y-2">
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
              disabled={loading}
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
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
              disabled={loading}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
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
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={product.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
              required
              aria-required="true"
              disabled={loading}
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="image"
              value={product.image}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter image URL"
              disabled={loading}
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
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image'}}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 md:w-auto"
              disabled={loading}
            >
              Back to Products
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;