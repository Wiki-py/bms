import React, { useState } from 'react';

const POSDashboard = () => {
  // Sample product data
  const [products] = useState([
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 15 },
    { id: 2, name: 'Smartphone', price: 699.99, category: 'Electronics', stock: 32 },
    { id: 3, name: 'Headphones', price: 149.99, category: 'Electronics', stock: 45 },
    { id: 4, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 12 },
    { id: 5, name: 'Coffee Maker', price: 89.99, category: 'Appliances', stock: 24 },
    { id: 6, name: 'Water Bottle', price: 24.99, category: 'Accessories', stock: 60 },
    { id: 7, name: 'Notebook', price: 9.99, category: 'Office', stock: 100 },
    { id: 8, name: 'Wireless Mouse', price: 39.99, category: 'Electronics', stock: 38 },
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(8.5);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(product => product.category))];

  // Add to cart function
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Update quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  // Checkout function
  const checkout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    alert(`Order placed successfully! Total: UGX ${total.toFixed(2)}`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Staff Point of Sale</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-white  rounded-lg text-white w-full"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg text-gray-800"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 container mx-auto">
        {/* Products Section */}
        <div className="w-full md:w-3/5 bg-white rounded-lg shadow p-4 overflow-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-green-600 font-bold text-xl my-2">UGX {product.price.toFixed(2)}</p>
                  <p className="text-blue-500 text-sm">In stock: {product.stock}</p>
                </div>
                <button 
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                  onClick={() => addToCart(product)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-2/5 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 text-center">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-auto mb-4">
                {cart.map(item => (
                  <div key={item.id} className="border-b border-gray-200 py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">UGX {item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 touch-manipulation"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateQuantity(item.id, isNaN(val) ? 1 : val);
                          }}
                          className="w-12 px-2 py-1 text-center border-x border-gray-300 appearance-none"
                        />
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 touch-manipulation"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-semibold w-20 text-right">UGX {(item.price * item.quantity).toFixed(2)}</p>
                      <button 
                        className="text-red-500 hover:text-red-700 p-1 touch-manipulation"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">UGX {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Discount (%):</label>
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <span className="text-red-600">-UGX {discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Tax (%):</label>
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      step="0.1"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </div>
                  <span>UGX {taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>UGX {total.toFixed(2)}</span>
                </div>
                
                <button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 touch-manipulation"
                  onClick={checkout}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;