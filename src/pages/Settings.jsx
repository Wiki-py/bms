import React, { useState } from 'react';

const BusinessSettingsPage = () => {
  // Sample initial business settings data
  const [settings, setSettings] = useState({
    name: 'My Business',
    logo: 'https://via.placeholder.com/150', // Placeholder logo
    address: '123 Business St, City, Country',
    phone: '+1 (123) 456-7890',
    email: 'info@mybusiness.com',
    currency: 'USD',
    taxRate: 10,
  });
  const [logoPreview, setLogoPreview] = useState(settings.logo);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'UGX', symbol: 'USh' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!settings.name.trim()) newErrors.name = 'Business name is required';
    if (!settings.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(settings.email)) newErrors.email = 'Email is invalid';
    if (!settings.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(settings.phone)) newErrors.phone = 'Phone number is invalid';
    if (settings.taxRate < 0 || settings.taxRate > 100) newErrors.taxRate = 'Tax rate must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setSettings((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert('Settings saved successfully!');
  };

  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Business Settings
        </h1>
        
        {/* Settings Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                name="name"
                value={settings.name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.name 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="Enter business name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-3 flex justify-center">
                <img 
                  src={logoPreview} 
                  alt="Business Logo Preview" 
                  className="w-32 h-32 object-contain rounded-xl shadow-md bg-gray-100 p-2"
                />
              </div>
            </div>
            
            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows="3"
                placeholder="Enter business address"
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.phone 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="+1 (123) 456-7890"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="info@mybusiness.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Selected: {getCurrencySymbol(settings.currency)} ({settings.currency})
              </p>
            </div>
            
            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                    errors.taxRate 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.taxRate && <p className="mt-1 text-sm text-red-600">{errors.taxRate}</p>}
            </div>
            
            {/* Save Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white shadow-lg`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsPage;