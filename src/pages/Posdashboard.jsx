import React, { useState } from 'react';

const POSDashboard = () => {
  const [products] = useState([
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 15, image: 'https://via.placeholder.com/150?text=Laptop' },
    { id: 2, name: 'Smartphone', price: 699.99, category: 'Electronics', stock: 32, image: 'https://via.placeholder.com/150?text=Smartphone' },
    { id: 3, name: 'Headphones', price: 149.99, category: 'Electronics', stock: 45, image: 'https://via.placeholder.com/150?text=Headphones' },
    { id: 4, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 12, image: 'https://via.placeholder.com/150?text=Chair' },
    { id: 5, name: 'Coffee Maker', price: 89.99, category: 'Appliances', stock: 24, image: 'https://via.placeholder.com/150?text=Coffee+Maker' },
    { id: 6, name: 'Water Bottle', price: 24.99, category: 'Accessories', stock: 60, image: 'https://via.placeholder.com/150?text=Bottle' },
    { id: 7, name: 'Notebook', price: 9.99, category: 'Office', stock: 100, image: 'https://via.placeholder.com/150?text=Notebook' },
    { id: 8, name: 'Wireless Mouse', price: 39.99, category: 'Electronics', stock: 38, image: 'https://via.placeholder.com/150?text=Mouse' },
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(8.5);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(product => product.category))];

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

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const checkout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    alert(`Order placed successfully! Total: UGX ${total.toFixed(2)}`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-extrabold mb-4 md:mb-0 tracking-tight">Staff Point of Sale</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all w-full"
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
                <option key={category} value={category} className="bg-gray-800">{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 p-6 gap-6 container mx-auto">
        {/* Products Section */}
        <div className="w-full md:w-3/5 bg-white rounded-2xl shadow-xl p-6 overflow-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-100">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="border border-gray-100 rounded-xl p-4 flex flex-col bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-emerald-600 font-bold text-xl my-2">UGX {product.price.toFixed(2)}</p>
                  <p className="text-indigo-500 text-sm">In stock: {product.stock}</p>
                </div>
                <button 
                  className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
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
        <div className="w-full md:w-2/5 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-400 text-lg font-medium">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-auto mb-6 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="border-b border-gray-100 py-4 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500">UGX {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
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
                          className="w-12 px-2 py-1 text-center border-x border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <button 
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-semibold w-24 text-right text-gray-800">UGX {(item.price * item.quantity).toFixed(2)}</p>
                      <button 
                        className="text-rose-500 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">UGX {subtotal.toFixed(2)}</span>
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
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <span className="text-rose-600 font-medium">-UGX {discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Tax (%):</label>
                    <input
                      type="number"
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      min="0"
                      step="0.1"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </div>
                  <span className="font-medium">UGX {taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-gray-800">
                  <span>Total:</span>
                  <span>UGX {total.toFixed(2)}</span>
                </div>
                
                <button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
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