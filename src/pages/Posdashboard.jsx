import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const POSDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  

  const API_BASE = 'http://127.0.0.1:8000/api';

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    let response = await fetch(url, config);
    
    if (response.status === 401) {
      token = await refreshToken();
      config.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, config);
    }
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${API_BASE}/products/`);
        const data = await response.json();
        
        const mappedProducts = data.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.selling_price),
          category: p.category,
          stock: parseInt(p.quantity),
          image: p.image || 'https://via.placeholder.com/150?text=No+Image',
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        if (err.message.includes('No access token') || err.message.includes('Token refresh failed')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const categories = useMemo(() => ['All', ...new Set(products.map(product => product.category))], [products]);

  const filteredProducts = useMemo(() => 
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
    [products, searchTerm, selectedCategory]
  );

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('This item is out of stock!');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Cannot add more; limited stock!');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    if (newQuantity > item.stock) {
      alert('Cannot exceed available stock!');
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const paymentMethods = ['Cash', 'Mobile Money', 'Card', 'Bank Transfer'];

  const checkout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const saleData = {
        customer_name: customerName,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
      };

      await fetchWithAuth(`${API_BASE}/sales/`, {
        method: 'POST',
        body: JSON.stringify(saleData),
      });

      // Update local stock
      const updatedProducts = products.map(p => {
        const soldItem = cart.find(item => item.id === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
        return p;
      });
      setProducts(updatedProducts);

      // Generate receipt
      const receipt = {
        date: new Date().toLocaleString('en-UG', { timeZone: 'Africa/Kampala' }),
        customer: customerName,
        items: cart.map(item => ({ name: item.name, qty: item.quantity, price: item.price, total: item.price * item.quantity })),
        subtotal,
        discountAmount,
        taxAmount,
        total,
        paymentMethod,
      };
      
      setReceiptData(receipt);
      setShowReceipt(true);
      setCart([]);
      setCustomerName('');
      setDiscount(0);
      setPaymentMethod('Cash');
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.message}. Please try again.`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 sm:p-6 shadow-xl">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Staff Point of Sale</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-12 pr-4 py-2.5 w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 gap-6 container mx-auto">
        {/* Products Section */}
        <div className="w-full lg:w-3/5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 overflow-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-100">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className={`border border-gray-100 rounded-xl p-4 flex flex-col bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${product.stock <= 5 ? 'ring-2 ring-yellow-300' : ''}`}>
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3 shadow-md" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                <div className="flex-grow">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-2">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">{product.category}</p>
                  <p className="text-emerald-600 font-bold text-lg sm:text-xl my-2">UGX {product.price.toLocaleString()}</p>
                  <p className={`text-sm font-medium ${product.stock > 10 ? 'text-indigo-500' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Stock: {product.stock}
                  </p>
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">Low stock warning!</p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-xs text-red-600 mt-1">Out of stock!</p>
                  )}
                </div>
                <button 
                  disabled={product.stock <= 0}
                  className={`mt-3 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 ${
                    product.stock > 0 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}
                  onClick={() => addToCart(product)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your search.</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-2/5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-indigo-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shopping Cart ({cart.length} items)</h2>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M12 13V9a1 1 0 00-1-1h-1a1 1 0 00-1 1v4a1 1 0 00 1 1h1a1 1 0 001 1z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">Add products to get started</p>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-auto mb-6 space-y-4 max-h-96">
                {cart.map(item => (
                  <div key={item.id} className="border-b border-gray-100 py-4 flex justify-between items-center group last:border-b-0">
                    <div className="flex items-center gap-3 flex-1">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shadow" onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=No+Image'; }} />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500 truncate">UGX {item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateQuantity(item.id, isNaN(val) ? 1 : val);
                          }}
                          className="w-12 px-2 py-1 text-center border-x border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                        />
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-semibold w-20 text-right text-gray-800">UGX {(item.price * item.quantity).toLocaleString()}</p>
                      <button 
                        className="text-rose-500 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6 space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={checkoutLoading}
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={checkoutLoading}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">UGX {subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Discount (%):</label>
                      <input
                        type="number"
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        min="0"
                        max="100"
                        step="0.1"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                        disabled={checkoutLoading}
                      />
                    </div>
                    <span className="text-rose-600 font-medium">-UGX {discountAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Tax (VAT %):</label>
                      <input
                        type="number"
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        min="0"
                        step="0.1"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value))}
                        disabled={checkoutLoading}
                      />
                    </div>
                    <span className="font-medium">+UGX {taxAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-gray-800">
                  <span>Total:</span>
                  <span className="text-emerald-600">UGX {total.toLocaleString()}</span>
                </div>
                
                <button 
                  disabled={cart.length === 0 || !customerName.trim() || checkoutLoading}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    cart.length > 0 && customerName.trim() && !checkoutLoading
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-400 text-white'
                  }`}
                  onClick={checkout}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Checkout
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Receipt</h2>
              <p className="text-sm text-gray-600">Thank you for your purchase!</p>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p><span className="font-medium">Date:</span> {receiptData.date}</p>
                <p><span className="font-medium">Customer:</span> {receiptData.customer}</p>
                <p><span className="font-medium">Payment:</span> {receiptData.paymentMethod}</p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                {receiptData.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{item.name} (x{item.qty})</span>
                    <span>UGX {item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {receiptData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-UGX {receiptData.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (VAT):</span>
                  <span>+UGX {receiptData.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-emerald-600">UGX {receiptData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={closeReceipt}
                className="bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-2 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  closeReceipt();
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSDashboard;