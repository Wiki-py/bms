import React, { useState } from 'react';

const BusinessSettingsPage = () => {
  // Sample initial business settings data
  const [settings, setSettings] = useState({
    name: 'My Business',
    logo: 'https://via.placeholder.com/150', // Placeholder logo
    address: '123 Business St, City, Country',
    phone: '+1 (123) 456-7890',
    email: 'info@mybusiness.com',
    currency: '$',
    taxRate: '10%',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate saving settings (e.g., API call)
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Business Settings</h1>
      
      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-md rounded-lg p-6 max-w-lg mx-auto space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            name="name"
            value={settings.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="text"
            name="logo"
            value={settings.logo}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <img src={settings.logo} alt="Business Logo" className="mt-2 w-32 h-32 object-contain" />
        </div>
        
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={settings.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            type="text"
            name="currency"
            value={settings.currency}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Tax Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
          <input
            type="text"
            name="taxRate"
            value={settings.taxRate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Save Button */}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default BusinessSettingsPage;