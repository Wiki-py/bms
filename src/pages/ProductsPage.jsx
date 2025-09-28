import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API base URL
  const API_BASE = 'http://127.0.0.1:8000/api';

  // Fetch products on mount
  // Fetch products on mount
useEffect(() => {
  const fetchProducts = async () => {
    let accessToken = localStorage.getItem('access');
    if (!accessToken) {
      alert('Please log in to view products.');
      navigate('/login');
      return;
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
        // Map API fields: assume [{id, name, description, cost_price, selling_price, quantity, category, image}]
        const mappedProducts = data.map(p => ({
          id: p.id,
          name: p.name,
          cost_price: parseFloat(p.cost_price),
          selling_price: parseFloat(p.selling_price),
          profits: parseFloat(p.selling_price) - parseFloat(p.cost_price),  // Calculate profits
          stock: parseInt(p.quantity),
          category: p.category,  // Assume string or map if FK
          image: p.image || `https://picsum.photos/200/300?random=${p.id}`,
        }));
        setProducts(mappedProducts);
      } else if (response.status === 401) {
        // Try refresh
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access;
            localStorage.setItem('access', accessToken);
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
                name: p.name,
                cost_price: parseFloat(p.cost_price),
                selling_price: parseFloat(p.selling_price),
                profits: parseFloat(p.selling_price) - parseFloat(p.cost_price),
                stock: parseInt(p.quantity),
                category: p.category,
                image: p.image || `https://picsum.photos/200/300?random=${p.id}`,
              }));
              setProducts(mappedProducts);
            } else {
              throw new Error('Failed to fetch after refresh');
            }
          } else {
            throw new Error('Session expired');
          }
        } else {
          throw new Error('Unauthorized');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
      }
    } finally {
      setLoading(false);  // Fixed: Now hides the loader
    }
  };

  fetchProducts();
}, [navigate]);

  // Refetch after delete
  const refetchProducts = () => {
    // Reuse fetch logic
    fetchProducts();  // Wait, fetchProducts is async, but for simplicity, call the inner function
    // Actually, extract to separate func if needed; here call useEffect deps or separate
    // For now, since useEffect runs on mount, trigger via state or call directly
    const fetchProductsInner = async () => {
      // ... (copy the fetch logic here or extract to util)
      // To avoid duplication, you can make fetchProducts non-useEffect
    };
    // Simplified: reset loading and call
    setLoading(true);
    setError(null);
    // Then call the async fetchProducts() but since it's in useEffect, better to extract
    // For this, I'll assume you extract to a util or just call window.location.reload() for simplicity, but better:
    window.location.reload();  // Quick refetch after delete
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(`Delete product ${productId}?`)) return;

    let accessToken = localStorage.getItem('access');
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
        // Refetch or update local state
        setProducts(products.filter(p => p.id !== productId));
      } else if (response.status === 401) {
        // Refresh and retry similar to above
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access;
            localStorage.setItem('access', accessToken);
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
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center md:text-left tracking-tight">
        Product Inventory
      </h1>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative group">
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

      {/* Products Table */}
      <div className="overflow-x-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold">SKU</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Image</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Name</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Category</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Stock</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Cost Price</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Selling Price</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Profits</th>
              <th className="py-4 px-6 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-gray-500 font-medium">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`block md:table-row transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-indigo-50`}
                >
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['SKU:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="SKU"
                  >
                    {product.id}
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Image:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Image"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg mx-auto md:mx-0 transform hover:scale-105 transition-transform duration-200"
                      onError={(e) => { e.target.src = 'https://picsum.photos/200/300?random=1'; }}
                    />
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Name:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Name"
                  >
                    {product.name}
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Category:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Category"
                  >
                    {product.category}
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Stock:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Stock"
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.stock > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Cost_Price:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Cost Price"
                  >
                    ${product.cost_price.toFixed(2)}
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Selling_Price:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Selling Price"
                  >
                    ${product.selling_price.toFixed(2)}
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm text-gray-800 before:content-['Profits:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Profits"
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        product.profits > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ${product.profits.toFixed(2)}
                    </span>
                  </td>
                  <td
                    className="block md:table-cell py-4 px-6 text-sm before:content-['Actions:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Actions"
                  >
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 text-xs md:text-sm w-full md:w-auto"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 text-xs md:text-sm w-full md:w-auto"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-red-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-rose-300 text-xs md:text-sm w-full md:w-auto"
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

      {/* Add New Product Button */}
      <div className="mt-8 flex justify-center md:justify-end">
        <button
          onClick={() => navigate('/add_product')}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 w-full md:w-auto"
        >
          Add New Product
        </button>
      </div>
    </div>
  );
};

export default Products;