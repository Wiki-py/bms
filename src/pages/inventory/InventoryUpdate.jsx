import React, { useState } from 'react';

// Mock data (same as your report)
const mockItems = [
  { id: 1, name: 'Laptop', quantity: 3, price: 999.99, category: 'Electronics', created_at: '2025-09-01T10:00:00Z' },
  { id: 2, name: 'T-Shirt', quantity: 10, price: 19.99, category: 'Clothing', created_at: '2025-09-02T12:00:00Z' },
  { id: 3, name: 'Coffee', quantity: 0, price: 5.99, category: 'Food', created_at: '2025-09-03T14:00:00Z' },
  { id: 4, name: 'Chair', quantity: 2, price: 49.99, category: 'Furniture', created_at: '2025-09-04T16:00:00Z' },
  { id: 5, name: 'Headphones', quantity: 8, price: 199.99, category: 'Electronics', created_at: '2025-09-05T09:00:00Z' },
  { id: 6, name: 'Jeans', quantity: 5, price: 59.99, category: 'Clothing', created_at: '2025-09-06T11:00:00Z' },
];

const InventoryUpdate = () => {
  const [items, setItems] = useState(mockItems);
  const [filteredItems, setFilteredItems] = useState(mockItems);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    price: 0,
    category: 'Electronics'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const categories = ['All', 'Electronics', 'Clothing', 'Food', 'Furniture'];
  const stockOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Filter items based on search and filters
  const applyFilters = () => {
    let filtered = items;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by stock status
    if (stockFilter !== 'All') {
      switch (stockFilter) {
        case 'In Stock':
          filtered = filtered.filter(item => item.quantity > 5);
          break;
        case 'Low Stock':
          filtered = filtered.filter(item => item.quantity > 0 && item.quantity <= 5);
          break;
        case 'Out of Stock':
          filtered = filtered.filter(item => item.quantity === 0);
          break;
        default:
          break;
      }
    }

    setFilteredItems(filtered);
  };

  // Apply filters when search term or filters change
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, stockFilter, items]);

  // Filter low stock and out of stock items for stats
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 5);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'text-red-600 font-bold';
    if (quantity <= 5) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const getStockBadgeClass = (quantity) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockLabel = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    const updatedItems = items.map(item => 
      item.id === editingId ? { ...editForm } : item
    );
    setItems(updatedItems);
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'category' ? value : 
               field === 'quantity' ? parseInt(value) || 0 : 
               parseFloat(value) || 0
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'category' ? value : 
               field === 'quantity' ? parseInt(value) || 0 : 
               parseFloat(value) || 0
    }));
  };

  const addNewItem = () => {
    const newItemWithId = {
      ...newItem,
      id: Math.max(...items.map(item => item.id)) + 1,
      created_at: new Date().toISOString()
    };
    const updatedItems = [...items, newItemWithId];
    setItems(updatedItems);
    setNewItem({
      name: '',
      quantity: 0,
      price: 0,
      category: 'Electronics'
    });
    setShowAddForm(false);
  };

  const deleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStockFilter('All');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Update Inventory
          </h1>
          <p className="text-gray-600 mt-2">Manage your inventory items</p>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 rounded-xl shadow-lg">
            <div className="text-sm font-semibold">Total Items</div>
            <div className="text-xl font-bold">{items.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-4 rounded-xl shadow-lg">
            <div className="text-sm font-semibold">Low Stock</div>
            <div className="text-xl font-bold">{lowStockItems.length}</div>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white p-4 rounded-xl shadow-lg">
            <div className="text-sm font-semibold">Out of Stock</div>
            <div className="text-xl font-bold">{outOfStockItems.length}</div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by item name..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600">✕</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {stockOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Results and Clear Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {filteredItems.length} of {items.length} items
              {(searchTerm || categoryFilter !== 'All' || stockFilter !== 'All') && (
                <span className="ml-2 text-blue-600">
                  (Filtered)
                </span>
              )}
            </div>
            {(searchTerm || categoryFilter !== 'All' || stockFilter !== 'All') && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <span>✕</span> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Add New Item Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
          >
            <span>➕</span> {showAddForm ? 'Cancel Adding' : 'Add New Item'}
          </button>
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6 border border-green-200">
            <h3 className="font-semibold text-green-700 mb-4 text-lg">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleNewItemChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => handleNewItemChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {categories.filter(cat => cat !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => handleNewItemChange('quantity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => handleNewItemChange('price', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>
            <button
              onClick={addNewItem}
              className="w-full md:w-auto mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Add Item to Inventory
            </button>
          </div>
        )}

        {/* Inventory Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className={`bg-white rounded-xl shadow-lg border-l-4 ${
              item.quantity === 0 ? 'border-red-400' : 
              item.quantity <= 5 ? 'border-orange-400' : 
              'border-green-400'
            } hover:shadow-xl transition-shadow`}>
              {editingId === item.id ? (
                // Edit Form
                <div className="p-4 md:p-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg font-semibold text-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => handleEditChange('quantity', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => handleEditChange('price', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => handleEditChange('category', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.filter(cat => cat !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={saveEdit}
                        className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Display Item
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStockBadgeClass(item.quantity)}`}>
                      {getStockLabel(item.quantity)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className={`font-semibold ${getStockClass(item.quantity)}`}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-semibold">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium text-blue-600">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium mb-2">No items found</p>
            <p className="text-sm">
              {items.length === 0 ? 'Add your first item using the button above' : 'Try adjusting your search or filters'}
            </p>
            {(searchTerm || categoryFilter !== 'All' || stockFilter !== 'All') && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Quick Actions Footer - Responsive */}
        <div className="fixed bottom-4 left-4 right-4 md:static md:mt-8">
          <div className="bg-white/90 md:bg-white backdrop-blur-sm rounded-xl shadow-lg p-4 border md:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm font-semibold text-gray-700 text-center sm:text-left">
                <span className="text-orange-600">{lowStockItems.length} low stock</span> • 
                <span className="text-red-600"> {outOfStockItems.length} out of stock</span>
              </div>
              <button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryUpdate;