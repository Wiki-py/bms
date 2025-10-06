import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API base URL - updated to use your deployed backend
  const API_BASE = 'https://pos-backend-8i4g.onrender.com/api';

  // Extract fetch logic to a reusable function
  const fetchProducts = async () => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!accessToken) {
      throw new Error('Please log in to view products.');
    }

    try {
      const response = await fetch(`${API_BASE}/products/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Products API response:', data);
        
        // Map API fields with better error handling
        const mappedProducts = data.map(p => ({
          id: p.id,
          name: p.name || 'Unnamed Product',
          cost_price: parseFloat(p.cost_price || p.price || 0),
          selling_price: parseFloat(p.selling_price || p.price || 0),
          profits: parseFloat(p.selling_price || p.price || 0) - parseFloat(p.cost_price || p.price || 0),
          stock: parseInt(p.quantity || p.stock || 0),
          category: p.category || 'Uncategorized',
          image: p.image || `https://picsum.photos/200/300?random=${p.id}`,
        }));
        return mappedProducts;
      } else if (response.status === 401) {
        // Try refresh
        const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access;
            localStorage.setItem('access_token', accessToken);
            // Retry fetch
            const retryResponse = await fetch(`${API_BASE}/products/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              const mappedProducts = data.map(p => ({
                id: p.id,
                name: p.name || 'Unnamed Product',
                cost_price: parseFloat(p.cost_price || p.price || 0),
                selling_price: parseFloat(p.selling_price || p.price || 0),
                profits: parseFloat(p.selling_price || p.price || 0) - parseFloat(p.cost_price || p.price || 0),
                stock: parseInt(p.quantity || p.stock || 0),
                category: p.category || 'Uncategorized',
                image: p.image || `https://picsum.photos/200/300?random=${p.id}`,
              }));
              return mappedProducts;
            } else {
              throw new Error('Failed to fetch after refresh');
            }
          } else {
            throw new Error('Session expired');
          }
        } else {
          throw new Error('Unauthorized');
        }
      } else if (response.status === 404) {
        console.warn('Products endpoint not found, using fallback data');
        return getFallbackProducts();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        throw new Error('Session expired. Please log in again.');
      }
      throw err;
    }
  };

  // Fallback products data
  const getFallbackProducts = () => [
    {
      id: 1,
      name: 'Laptop Computer',
      cost_price: 1200000,
      selling_price: 1500000,
      profits: 300000,
      stock: 15,
      category: 'Electronics',
      image: 'https://picsum.photos/200/300?random=1'
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      cost_price: 15000,
      selling_price: 25000,
      profits: 10000,
      stock: 50,
      category: 'Electronics',
      image: 'https://picsum.photos/200/300?random=2'
    },
    {
      id: 3,
      name: 'Office Chair',
      cost_price: 45000,
      selling_price: 75000,
      profits: 30000,
      stock: 10,
      category: 'Furniture',
      image: 'https://picsum.photos/200/300?random=3'
    },
    {
      id: 4,
      name: 'Desk Lamp',
      cost_price: 8000,
      selling_price: 15000,
      profits: 7000,
      stock: 25,
      category: 'Home',
      image: 'https://picsum.photos/200/300?random=4'
    }
  ];

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading products:', err);
        if (err.message.includes('Session expired') || err.message.includes('Please log in')) {
          setError(err.message);
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.message.includes('404') || err.message.includes('not found')) {
          setError('Products endpoint not available. Using demo data.');
          setProducts(getFallbackProducts());
        } else {
          setError(err.message);
          // Use fallback data on other errors
          setProducts(getFallbackProducts());
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);

  // Refetch products
  const refetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error refetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Are you sure you want to delete product #${productId}?`)) return;

    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!accessToken) {
      alert('Please log in.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        // Update local state
        setProducts(products.filter(p => p.id !== productId));
      } else if (response.status === 401) {
        // Refresh and retry
        const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access;
            localStorage.setItem('access_token', accessToken);
            // Retry delete
            const retryResponse = await fetch(`${API_BASE}/products/${productId}/`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
            });
            if (retryResponse.ok) {
              alert('Product deleted successfully!');
              setProducts(products.filter(p => p.id !== productId));
            } else {
              throw new Error('Delete failed after refresh');
            }
          } else {
            throw new Error('Session expired');
          }
        }
      } else if (response.status === 404) {
        // If endpoint doesn't exist, just remove from local state
        alert('Product removed locally (API endpoint not available)');
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      if (err.message.includes('404') || err.message.includes('not found')) {
        // If API endpoint doesn't exist, still remove from local state
        alert('Product removed locally (API endpoint not available)');
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <span className="text-yellow-800">{error}</span>
            </div>
            <button 
              onClick={refetchProducts}
              className="text-yellow-700 hover:text-yellow-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 lg:mb-0 tracking-tight">
          Product Inventory
        </h1>
        <button
          onClick={() => navigate('/add-product')}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 w-full lg:w-auto"
        >
          + Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative group max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white/80 transition-all duration-200"
          />
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold">ID</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Image</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Name</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Category</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Stock</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Cost Price</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Selling Price</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Profit</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-gray-500 font-medium">
                  {products.length === 0 ? 'No products found.' : 'No products match your search.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-indigo-50`}
                >
                  <td className="py-4 px-6 text-sm text-gray-800 font-mono">
                    #{product.id}
                  </td>
                  <td className="py-4 px-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg mx-auto transform hover:scale-105 transition-transform duration-200"
                      onError={(e) => { e.target.src = 'https://picsum.photos/200/300?random=1'; }}
                    />
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.stock > 10
                          ? 'bg-amber-100 text-amber-800'
                          : product.stock > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                    {formatCurrency(product.cost_price)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-800 font-bold">
                    {formatCurrency(product.selling_price)}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        product.profits > 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {formatCurrency(product.profits)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-lg hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-lg hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-3 py-1 rounded-lg hover:from-rose-600 hover:to-red-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-rose-300 text-xs"
                      >
                        Delete
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
  );
};

export default Products;