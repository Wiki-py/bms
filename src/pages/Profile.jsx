import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://bms-api-2.onrender.com/api';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    location: '',
  });
  const [locations, setLocations] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Centralized API call handler with automatic token refresh
  const apiCall = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!accessToken) {
      throw new Error('UNAUTHORIZED');
    }

    const makeRequest = async (token) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
      
      if (!refreshToken) {
        throw new Error('UNAUTHORIZED');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('UNAUTHORIZED');
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access;
        localStorage.setItem('access', accessToken);
        localStorage.setItem('access_token', accessToken);

        response = await makeRequest(accessToken);
      } catch (error) {
        throw new Error('UNAUTHORIZED');
      }
    }

    return response;
  }, []);

  // Handle logout and redirect
  const handleAuthError = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Fetch user profile and locations
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!accessToken) {
          handleAuthError();
          return;
        }

        const profileResponse = await apiCall(`${API_BASE}/users/profile/`);
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        
        setUser(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          role: profileData.role || '',
          location: profileData.location || '',
        });

        localStorage.setItem('user', JSON.stringify(profileData));

        try {
          const locationsResponse = await apiCall(`${API_BASE}/branches/`);
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            setLocations(locationsData.map(branch => branch.location));
          }
        } catch (err) {
          console.warn('Failed to fetch locations:', err);
        }

      } catch (err) {
        console.error('Profile fetch error:', err);
        
        if (err.message === 'UNAUTHORIZED') {
          handleAuthError();
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiCall, handleAuthError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (formData.phone && !/^[\d\s\-+()]{7,20}$/.test(formData.phone.trim())) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiCall(`${API_BASE}/users/profile/`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      console.error('Profile update error:', err);
      
      if (err.message === 'UNAUTHORIZED') {
        handleAuthError();
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || '',
        location: user?.location || '',
      });
      setValidationErrors({});
      setError(null);
    }
    setEditMode(!editMode);
  };

  const getRoleIcon = (role) => {
    const icons = {
      Admin: '👑',
      Manager: '💼',
      Staff: '👨‍💼',
      Cashier: '💰',
    };
    return icons[role] || '👤';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: 'from-purple-500 to-pink-500',
      Manager: 'from-blue-500 to-indigo-500',
      Staff: 'from-teal-500 to-cyan-500',
      Cashier: 'from-emerald-500 to-green-500',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-violet-600 to-pink-600 rounded-full w-24 h-24 flex items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header with Glass Effect */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Profile</h1>
                  <p className="text-purple-100 mt-1">Manage your personal information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="group bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-semibold">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Banner with Animation */}
        {success && (
          <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg animate-slide-down">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="relative p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-semibold text-lg">{success}</span>
              </div>
              <button 
                onClick={() => setSuccess(null)}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Banner with Animation */}
        {error && (
          <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg animate-slide-down">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <div className="relative p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-10"></div>
          
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center lg:items-start space-y-6">
                <div className="relative group">
                  {/* Avatar with Gradient Border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=200&background=random&bold=true`}
                      alt="Profile"
                      className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=200&background=random&bold=true`;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white p-3 rounded-full shadow-xl border-4 border-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className={`bg-gradient-to-r ${getRoleBadgeColor(user?.role)} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center space-x-2`}>
                  <span className="text-2xl">{getRoleIcon(user?.role)}</span>
                  <span className="font-bold text-lg">{user?.role || 'Staff'}</span>
                </div>

                {/* Quick Stats */}
                <div className="w-full bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Account Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold text-gray-800">2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="flex-1 lg:pl-10">
                {!editMode ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b-2 border-gradient-to-r from-violet-200 to-pink-200">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Profile Information</h2>
                        <p className="text-gray-500 mt-1">Your personal details and settings</p>
                      </div>
                      <button
                        onClick={handleEditToggle}
                        className="group bg-gradient-to-r from-violet-600 to-pink-600 text-white py-3 px-8 rounded-2xl hover:from-violet-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="font-semibold">Edit Profile</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-bl-full"></div>
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <label className="text-sm font-bold text-violet-700 uppercase tracking-wide">Full Name</label>
                          </div>
                          <p className="text-xl font-bold text-gray-800">{user?.name || 'Not available'}</p>
                        </div>
                      </div>
                      
                      {/* Email Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-bl-full"></div>
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <label className="text-sm font-bold text-pink-700 uppercase tracking-wide">Email Address</label>
                          </div>
                          <p className="text-lg font-bold text-gray-800 break-all">{user?.email || 'Not available'}</p>
                        </div>
                      </div>
                      
                      {/* Phone Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-bl-full"></div>
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <label className="text-sm font-bold text-purple-700 uppercase tracking-wide">Phone Number</label>
                          </div>
                          <p className="text-lg font-bold text-gray-800">{user?.phone || 'Not available'}</p>
                        </div>
                      </div>
                      
                      {/* Location Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-bl-full"></div>
                        <div className="relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <label className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Location</label>
                          </div>
                          <p className="text-lg font-bold text-gray-800">{user?.location || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="pb-6 border-b-2 border-gradient-to-r from-violet-200 to-pink-200">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Edit Profile</h2>
                      <p className="text-gray-500 mt-1">Update your personal information</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          Full Name <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                            validationErrors.name 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {validationErrors.name && (
                          <p className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.name}
                          </p>
                        )}
                      </div>
                      
                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Address <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                            validationErrors.email 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.email}
                          </p>
                        )}
                      </div>
                      
                      {/* Phone Input */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                            validationErrors.phone 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                          }`}
                          placeholder="+256 700 000 000"
                        />
                        {validationErrors.phone && (
                          <p className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.phone}
                          </p>
                        )}
                      </div>
                      
                      {/* Role Select */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          Role <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                            validationErrors.role 
                              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                          }`}
                        >
                          <option value="">Select Role</option>
                          <option value="Admin">👑 Admin</option>
                          <option value="Manager">💼 Manager</option>
                          <option value="Staff">👨‍💼 Staff</option>
                          <option value="Cashier">💰 Cashier</option>
                        </select>
                        {validationErrors.role && (
                          <p className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.role}
                          </p>
                        )}
                      </div>
                      
                      {/* Location Input */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Location <span className="text-red-500 ml-1">*</span>
                        </label>
                        {locations.length > 0 ? (
                          <select
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                              validationErrors.location 
                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
                            }`}
                          >
                            <option value="">Select Location</option>
                            {locations.map((location) => (
                              <option key={location} value={location}>
                                📍 {location}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none transition-all duration-200 ${
                              validationErrors.location 
                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
                            }`}
                            placeholder="Enter your location"
                          />
                        )}
                        {validationErrors.location && (
                          <p className="text-red-500 text-sm flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t-2 border-gray-200">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        disabled={saving}
                        className="flex-1 group bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-semibold text-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-4 px-8 rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-semibold text-lg"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyProfile;