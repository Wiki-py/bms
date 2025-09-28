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
  const API_BASE = 'http://127.0.0.1:8000/api';

  // Fetch branches for locations
  useEffect(() => {
    const fetchBranches = async () => {
      const accessToken = localStorage.getItem('access');
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
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
              const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
              });
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('access', refreshData.access);
                const retryResponse = await fetch(`${API_BASE}/branches/`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshData.access}`,
                  },
                });
                if (!retryResponse.ok) throw new Error('Failed to fetch branches');
                const branchesData = await retryResponse.json();
                setLocations(branchesData.map((branch) => branch.location));
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
          setLocations(branchesData.map((branch) => branch.location));
        }
      } catch (err) {
        setErrors({ general: err.message });
        if (err.message.includes('Unauthorized') || err.message.includes('expired')) {
          localStorage.removeItem('access');
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
    const accessToken = localStorage.getItem('access');
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
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('access', refreshData.access);
              const retryResponse = await fetch(`${API_BASE}/users/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${refreshData.access}`,
                },
                body: formDataToSend,
              });
              if (!retryResponse.ok) throw new Error('Failed to create user');
              navigate('/manage-users');
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
          Add New User
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">User Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Name"
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">User Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="yourname@example.com"
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter Phone Number"
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
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
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Passport Upload */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">User Passport</label>
            <input
              type="file"
              name="passport"
              accept="image/jpeg,image/png"
              onChange={handleInputChange}
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">User Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Repeat Password */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Repeat Password</label>
            <input
              type="password"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleInputChange}
              placeholder="Password Again"
              className={`p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                errors.repeatPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              } bg-white text-gray-700`}
            />
            {errors.repeatPassword && <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/manage-users')}
              className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>❌</span> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`group bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>➕</span> {loading ? 'Creating...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;