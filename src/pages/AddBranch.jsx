import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddBranch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    openingDate: '',
    capacity: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('from-emerald-400 to-teal-500');

  const branchTypes = [
    'Electronics',
    'Clothing & Apparel',
    'Food & Beverages',
    'Home & Furniture',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Stationery',
    'Automotive',
    'Jewelry & Accessories',
    'Other'
  ];

  const colorOptions = [
    { value: 'from-emerald-400 to-teal-500', label: 'Emerald', preview: '🟢' },
    { value: 'from-cyan-400 to-blue-500', label: 'Cyan', preview: '🔵' },
    { value: 'from-orange-400 to-red-500', label: 'Orange', preview: '🟠' },
    { value: 'from-violet-400 to-purple-500', label: 'Violet', preview: '🟣' },
    { value: 'from-rose-400 to-pink-500', label: 'Rose', preview: '🌸' },
    { value: 'from-amber-400 to-yellow-500', label: 'Amber', preview: '🟡' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate unique ID and prepare branch data
      const newBranch = {
        id: `branch-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        location: formData.location,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        manager: formData.manager,
        openingDate: formData.openingDate,
        capacity: parseInt(formData.capacity),
        description: formData.description,
        color: selectedColor,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // In a real app, you would save to your backend here
      console.log('New branch data:', newBranch);
      
      // Show success message and redirect
      alert('Branch added successfully!');
      navigate('/business-dashboard?tab=branches');
      
    } catch (error) {
      console.error('Error adding branch:', error);
      alert('Error adding branch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/business-dashboard?tab=branches');
    }
  };

  const getBranchIcon = (type) => {
    const icons = {
      'Electronics': '💻',
      'Clothing & Apparel': '👕',
      'Food & Beverages': '☕',
      'Home & Furniture': '🏠',
      'Sports & Outdoors': '⚽',
      'Beauty & Health': '💄',
      'Books & Stationery': '📚',
      'Automotive': '🚗',
      'Jewelry & Accessories': '💎',
      'Other': '🏪'
    };
    return icons[type] || '🏪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/business-dashboard')}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Add New Branch
          </h1>
          <p className="text-gray-600 mt-2">Create a new branch for your business</p>
        </div>

        {/* Preview Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Branch Preview</h2>
          <div className={`p-6 rounded-lg ${selectedColor} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl mb-2">{getBranchIcon(formData.type)}</div>
                <h3 className="text-2xl font-bold">{formData.name || 'New Branch'}</h3>
                <p className="text-white/90">{formData.type || 'Select type'}</p>
                <p className="text-white/80 text-sm">{formData.location || 'Add location'}</p>
              </div>
              <div className="text-right">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">New</span>
                {formData.openingDate && (
                  <p className="text-white/80 text-sm mt-2">Opens: {new Date(formData.openingDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select branch type</option>
                  {branchTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g., Downtown, Mall, Uptown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map(color => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedColor === color.value 
                          ? 'border-indigo-500 ring-2 ring-indigo-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      } ${color.value} text-white font-bold`}
                    >
                      {color.preview}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="branch@company.com"
                />
              </div>

              {/* Additional Details */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Additional Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Manager's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Date
                </label>
                <input
                  type="date"
                  name="openingDate"
                  value={formData.openingDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (Employees)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Describe this branch's focus, special features, or any other relevant information..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                //onClick={() => {'/add_branch'}}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Branch...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Add Branch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Choose a descriptive name that reflects the branch's location or specialty</li>
            <li>• Select the appropriate branch type for accurate categorization</li>
            <li>• The color theme will be used throughout the dashboard for this branch</li>
            <li>• You can add products and employees after creating the branch</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddBranch;