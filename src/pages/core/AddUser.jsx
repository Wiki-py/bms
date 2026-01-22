import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    location: '',
    status: 'Active',
    phone: '',
    password: '',
    repeatPassword: '',
    passport: null,
  });
  const [locations, setLocations] = useState([]);
  const [roles] = useState(['Admin', 'Manager', 'Staff', 'Cashier']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const API_BASE = 'https://bms-api-2.onrender.com/api';

  // Fetch branches for locations
  useEffect(() => {
    const fetchBranches = async () => {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
      if (!accessToken) {
        alert('Please log in to access this page.');
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/branches/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
            if (refreshToken) {
              const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
              });
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('access', refreshData.access);
                localStorage.setItem('access_token', refreshData.access);
                const retryResponse = await fetch(`${API_BASE}/branches/`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshData.access}`,
                  },
                });
                if (!retryResponse.ok) throw new Error('Failed to fetch branches');
                const branchesData = await retryResponse.json();
                
                // Handle different API response formats for branches
                let branchesArray = [];
                if (Array.isArray(branchesData)) {
                  branchesArray = branchesData;
                } else if (branchesData.results && Array.isArray(branchesData.results)) {
                  branchesArray = branchesData.results;
                } else if (branchesData.data && Array.isArray(branchesData.data)) {
                  branchesArray = branchesData.data;
                } else {
                  console.warn('Unexpected branches API response format:', branchesData);
                  branchesArray = [];
                }
                
                setLocations(branchesArray.map((branch) => branch.location));
              } else {
                throw new Error('Session expired');
              }
            } else {
              throw new Error('Unauthorized');
            }
          } else {
            throw new Error('Failed to fetch branches');
          }
        } else {
          const branchesData = await response.json();
          
          // Handle different API response formats for branches
          let branchesArray = [];
          if (Array.isArray(branchesData)) {
            branchesArray = branchesData;
          } else if (branchesData.results && Array.isArray(branchesData.results)) {
            branchesArray = branchesData.results;
          } else if (branchesData.data && Array.isArray(branchesData.data)) {
            branchesArray = branchesData.data;
          } else {
            console.warn('Unexpected branches API response format:', branchesData);
            branchesArray = [];
          }
          
          // Validate main branches response
          if (!branchesArray.length) {
            throw new Error('No branches found');
          }
          
          setLocations(branchesArray.map((branch) => branch.location));
        }
      } catch (err) {
        setErrors({ general: err.message });
        if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('access');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('refresh');
          navigate('/login');
        }
      }
    };
    fetchBranches();
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.repeatPassword)
      newErrors.repeatPassword = 'Passwords do not match';
    if (!formData.location) newErrors.location = 'Location is required';
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      if (formData.passport) {
        formDataToSend.append('passport', formData.passport);
      }

      const response = await fetch(`${API_BASE}/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('access', refreshData.access);
              localStorage.setItem('access_token', refreshData.access);
              const retryResponse = await fetch(`${API_BASE}/users/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${refreshData.access}`,
                },
                body: formDataToSend,
              });
              if (!retryResponse.ok) throw new Error('Failed to create user');
              navigate('/users');
            } else {
              throw new Error('Session expired');
            }
          } else {
            throw new Error('Unauthorized');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create user');
        }
      } else {
        navigate('/users');
      }
    } catch (err) {
      setErrors({ general: err.message });
      if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{errors.general}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-2xl">👤</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Add New User</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-medium">Back to Users</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-800">{errors.general}</span>
              </div>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, general: '' }))}
                className="text-red-700 hover:text-red-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="yourname@example.com"
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter secure password"
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Repeat Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="repeatPassword"
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  className={`w-full p-3 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 ${
                    errors.repeatPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.repeatPassword && <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>}
              </div>
            </div>

            {/* Passport Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Passport/ID Document</label>
              <div className="relative">
                <input
                  type="file"
                  name="passport"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload passport or ID document (JPEG, PNG, or PDF)</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="w-full sm:w-auto bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-md transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;