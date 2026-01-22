import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [roles] = useState(['Admin', 'Manager', 'Staff', 'Cashier']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const API_BASE = 'https://bms-api-2.onrender.com/api';

  // Centralized API call handler with automatic token refresh
  const apiCall = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!accessToken) {
      throw new Error('No access token found');
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
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('access', accessToken);

        response = await makeRequest(accessToken);
      } catch (error) {
        throw new Error('UNAUTHORIZED');
      }
    }

    return response;
  }, [API_BASE]);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors({});

      try {
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!accessToken) {
          handleAuthError();
          return;
        }

        const usersResponse = await apiCall(`${API_BASE}/users/`);
        
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        
        let usersArray = [];
        if (Array.isArray(usersData)) {
          usersArray = usersData;
        } else if (usersData.results && Array.isArray(usersData.results)) {
          usersArray = usersData.results;
        } else if (usersData.data && Array.isArray(usersData.data)) {
          usersArray = usersData.data;
        } else {
          console.warn('Unexpected API response format:', usersData);
          usersArray = [];
        }

        setUserData(
          usersArray.map((user) => ({
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email || `${(user.name || 'user').replace(/\s+/g, '.').toLowerCase()}@example.com`,
            role: user.role || 'Staff',
            status: user.status || 'Active',
            location: user.location || 'Unknown',
            avatar: user.avatar || `${API_BASE}/avatars/${user.id}.png`,
          }))
        );

        const branchesResponse = await apiCall(`${API_BASE}/branches/`);
        
        if (!branchesResponse.ok) {
          throw new Error('Failed to fetch branches');
        }

        const branchesData = await branchesResponse.json();
        
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

      } catch (err) {
        console.error('Fetch error:', err);
        
        if (err.message === 'UNAUTHORIZED' || err.message === 'No access token found') {
          handleAuthError();
        } else {
          setErrors({ general: err.message || 'An error occurred while loading data' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, apiCall, handleAuthError]);

  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setErrors({});
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedUser.name?.trim()) newErrors.name = 'Name is required';
    if (!selectedUser.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedUser.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUser = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});
    
    try {
      const response = await apiCall(`${API_BASE}/users/${selectedUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          status: selectedUser.status,
          location: selectedUser.location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUserData((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? { ...user, ...updatedUser }
            : user
        )
      );
      closeModal();
    } catch (err) {
      console.error('Update user error:', err);
      
      if (err.message === 'UNAUTHORIZED') {
        handleAuthError();
      } else {
        setErrors({ general: 'Failed to update user. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiCall(`${API_BASE}/users/${selectedUser.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete user');
      }

      setUserData((prev) => prev.filter((user) => user.id !== selectedUser.id));
      closeDeleteModal();
    } catch (err) {
      console.error('Delete user error:', err);
      
      if (err.message === 'UNAUTHORIZED') {
        handleAuthError();
      } else {
        setErrors({ general: 'Failed to delete user. Please try again.' });
        closeDeleteModal();
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'from-emerald-500 to-green-500' 
      : 'from-red-500 to-pink-500';
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: 'from-purple-500 to-pink-500',
      Manager: 'from-blue-500 to-indigo-500',
      Staff: 'from-cyan-500 to-teal-500',
      Cashier: 'from-amber-500 to-orange-500',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
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
          <p className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Loading users...</p>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white/90 backdrop-blur-xl border border-red-200 rounded-3xl max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{errors.general}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            Manage Users
          </h1>
          <p className="text-gray-600 text-lg">View, edit, and manage all system users</p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{userData.length} Total Users</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-5 pl-14 pr-4 border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-200 bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-xl transition-all text-lg"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-xl font-medium">No users found matching your search</p>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="group relative bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
            >
              {/* Gradient Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
              
              <div className="relative">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-5">
                  <div className="relative mb-3">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full blur opacity-75"></div>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&bold=true`;
                      }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getStatusColor(user.status)} rounded-full border-4 border-white shadow-lg`}></div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 text-center group-hover:text-violet-700 transition-colors">{user.name}</h2>
                  <p className="text-xs text-gray-400 font-mono">#{user.id}</p>
                </div>

                {/* Info Cards */}
                <div className="space-y-3 mb-5">
                  {/* Email */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-3 rounded-xl border border-violet-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-xl border border-pink-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getRoleIcon(user.role)}</span>
                        <span className="text-sm font-semibold text-gray-700">Role</span>
                      </div>
                      <span className={`px-3 py-1 bg-gradient-to-r ${getRoleColor(user.role)} text-white text-xs font-bold rounded-full shadow-md`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{user.location}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => openEditModal(user)}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3 px-4 rounded-xl text-sm font-bold hover:from-violet-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/add_user')}
            className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-5 px-10 rounded-2xl text-xl font-bold hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add New User
          </button>
        </div>

        {/* Edit Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg shadow-2xl transform transition-all animate-slide-up">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-3xl opacity-20 blur"></div>
              
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Edit User
                </h2>
                
                {errors.general && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">{errors.general}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={selectedUser.name}
                      onChange={handleInputChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all ${
                        errors.name ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-violet-500 focus:ring-violet-100'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={selectedUser.email}
                      onChange={handleInputChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all ${
                        errors.email ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-pink-500 focus:ring-pink-100'
                      }`}
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Role
                    </label>
                    <select
                      name="role"
                      value={selectedUser.role}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleIcon(role)} {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Location
                    </label>
                    <select
                      name="location"
                      value={selectedUser.location}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          📍 {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Status
                    </label>
                    <select
                      name="status"
                      value={selectedUser.status}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all bg-white"
                    >
                      <option value="Active">✅ Active</option>
                      <option value="Inactive">❌ Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveUser}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all text-center animate-slide-up">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl opacity-20 blur"></div>
              
              <div className="relative">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete User?</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  {selectedUser.name}
                </p>
                <p className="text-sm text-red-600 font-medium mb-8">
                  ⚠️ This action cannot be undone
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteUser}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageUsersPage;