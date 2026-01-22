import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const API_BASE = 'https://bms-api-2.onrender.com/api';

  // Centralized API call handler with automatic token refresh
  const apiCall = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!accessToken) {
      throw new Error('UNAUTHORIZED');
    }

    const makeRequest = async (token) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
      
      if (!refreshToken) {
        throw new Error('UNAUTHORIZED');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('UNAUTHORIZED');
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('access', accessToken);

        response = await makeRequest(accessToken);
      } catch (error) {
        throw new Error('UNAUTHORIZED');
      }
    }

    return response;
  }, [API_BASE]);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!accessToken) {
          handleAuthError();
          return;
        }

        const response = await apiCall(`${API_BASE}/products/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        // Handle different response formats
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          productsArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          productsArray = [];
        }

        // Map API fields
        const mappedProducts = productsArray.map(p => ({
          id: p.id,
          name: p.name || 'Unnamed Product',
          cost_price: parseFloat(p.cost_price || p.price || 0),
          selling_price: parseFloat(p.selling_price || p.price || 0),
          profits: parseFloat(p.selling_price || p.price || 0) - parseFloat(p.cost_price || p.price || 0),
          stock: parseInt(p.quantity || p.stock || 0),
          category: p.category || 'Uncategorized',
          image: p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'Product')}&size=200&background=random`,
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Fetch error:', err);
        
        if (err.message === 'UNAUTHORIZED') {
          handleAuthError();
        } else {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE, apiCall, handleAuthError]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleteLoading(productId);

    try {
      const response = await apiCall(`${API_BASE}/products/${productId}/`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Delete error:', err);
      
      if (err.message === 'UNAUTHORIZED') {
        handleAuthError();
      } else {
        alert(`Delete failed: ${err.message}`);
      }
    } finally {
      setDeleteLoading(null);
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

  const getStockBadgeColor = (stock) => {
    if (stock > 50) return 'from-emerald-500 to-green-500';
    if (stock > 10) return 'from-amber-500 to-orange-500';
    if (stock > 0) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-violet-600 to-pink-600 rounded-full w-24 h-24 flex items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              Product Inventory
            </h1>
            <p className="text-gray-600 text-lg">Manage your product catalog and stock levels</p>
          </div>
          <Link 
            to="/add_product" 
            className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 text-lg font-bold flex items-center gap-3 w-full lg:w-auto justify-center"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add New Product
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-amber-800 font-semibold">{error}</span>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search Bar & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search products by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-5 pl-14 border-2 border-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-200 bg-white text-gray-700 placeholder-gray-400 shadow-xl transition-all text-lg font-medium"
                />
                <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Products</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  {filteredProducts.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">of {products.length} total</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white">
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">ID</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Image</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Product Name</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Category</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Stock</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Cost Price</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Selling Price</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Profit</th>
                  <th className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">
                          {products.length === 0 ? 'No products found' : 'No products match your search'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-5 px-6 text-sm font-bold text-gray-800">#{product.id}</td>
                      <td className="py-5 px-6">
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="relative w-16 h-16 object-cover rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=200&background=random`;
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm font-bold text-gray-800">{product.name}</td>
                      <td className="py-5 px-6 text-sm">
                        <span className="inline-flex px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm">
                        <span className={`inline-flex px-4 py-2 bg-gradient-to-r ${getStockBadgeColor(product.stock)} text-white rounded-full text-xs font-bold shadow-md`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-gray-600">
                        {formatCurrency(product.cost_price)}
                      </td>
                      <td className="py-5 px-6 text-sm font-bold text-gray-800">
                        {formatCurrency(product.selling_price)}
                      </td>
                      <td className="py-5 px-6 text-sm">
                        <span className={`inline-flex px-4 py-2 bg-gradient-to-r ${
                          product.profits > 0 
                            ? 'from-emerald-500 to-teal-500' 
                            : 'from-red-500 to-pink-500'
                        } text-white rounded-full text-xs font-bold shadow-md`}>
                          {formatCurrency(product.profits)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg text-xs font-bold"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-violet-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg text-xs font-bold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteLoading === product.id}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1"
                          >
                            {deleteLoading === product.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              </>
                            ) : (
                              <>🗑️ Delete</>
                            )}
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
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Products;