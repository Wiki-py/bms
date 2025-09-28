import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState(['Admin', 'Manager', 'Staff', 'Cashier']);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const API_BASE = 'http://127.0.0.1:8000/api';

  // Fetch users and branches on mount
  useEffect(() => {
    const fetchData = async () => {
      let accessToken = localStorage.getItem('access');
      if (!accessToken) {
        alert('Please log in to access the dashboard.');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await fetch(`${API_BASE}/users/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!usersResponse.ok) {
          if (usersResponse.status === 401) {
            // Attempt token refresh
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
              const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
              });
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                accessToken = refreshData.access;
                localStorage.setItem('access', accessToken);
                // Retry users fetch
                const retryResponse = await fetch(`${API_BASE}/users/`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                  },
                });
                if (!retryResponse.ok) throw new Error('Failed to fetch users after refresh');
                const usersData = await retryResponse.json();
                setUserData(
                  usersData.map((user) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email || `${user.name.replace(' ', '.').toLowerCase()}@example.com`, // Mock email if not provided
                    role: user.role,
                    status: user.status,
                    location: user.location,
                    avatar: `https://via.placeholder.com/40/${user.role === 'Admin' ? '4F46E5' : user.role === 'Manager' ? 'EC4899' : user.role === 'Staff' ? 'F59E0B' : '10B981'}/FFFFFF?text=${user.name[0]}${user.name.split(' ')[1]?.[0] || ''}`,
                  }))
                );
              } else {
                throw new Error('Session expired');
              }
            } else {
              throw new Error('Unauthorized');
            }
          } else {
            throw new Error('Failed to fetch users');
          }
        } else {
          const usersData = await usersResponse.json();
          setUserData(
            usersData.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email || `${user.name.replace(' ', '.').toLowerCase()}@example.com`,
              role: user.role,
              status: user.status,
              location: user.location,
              avatar: `https://via.placeholder.com/40/${user.role === 'Admin' ? '4F46E5' : user.role === 'Manager' ? 'EC4899' : user.role === 'Staff' ? 'F59E0B' : '10B981'}/FFFFFF?text=${user.name[0]}${user.name.split(' ')[1]?.[0] || ''}`,
            }))
          );
        }

        // Fetch branches for locations
        const branchesResponse = await fetch(`${API_BASE}/branches/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!branchesResponse.ok) throw new Error('Failed to fetch branches');
        const branchesData = await branchesResponse.json();
        setLocations(branchesData.map((branch) => branch.location));
      } catch (err) {
        console.error('Fetch error:', err);
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
    fetchData();
  }, [navigate]);

  // Filter users based on search query
  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal with selected user data
  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setErrors({});
  };

  // Open delete confirmation
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Handle form changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!selectedUser.name.trim()) newErrors.name = 'Name is required';
    if (!selectedUser.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(selectedUser.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save updated user data
  const saveUser = async () => {
    if (!validateForm()) return;
    const accessToken = localStorage.getItem('access');
    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          status: selectedUser.status,
          location: selectedUser.location,
        }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUserData((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                location: updatedUser.location,
              }
            : user
        )
      );
      closeModal();
    } catch (err) {
      console.error('Update user error:', err);
      setErrors({ general: 'Failed to update user' });
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;
    const accessToken = localStorage.getItem('access');
    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete user');
      setUserData((prev) => prev.filter((user) => user.id !== selectedUser.id));
      closeDeleteModal();
    } catch (err) {
      console.error('Delete user error:', err);
      setErrors({ general: 'Failed to delete user' });
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: 'bg-purple-100 text-purple-800',
      Manager: 'bg-indigo-100 text-indigo-800',
      Staff: 'bg-blue-100 text-blue-800',
      Cashier: 'bg-teal-100 text-teal-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-lg text-indigo-700">Loading users...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Manage Users
        </h1>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700 placeholder-gray-400 shadow-lg transition-all"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Users Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="group bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4 shadow-md" />
                <div>
                  <h2 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-800">{user.name}</h2>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium text-teal-600 mr-2">📧</span> {user.email}
                </p>
                <p className="text-sm flex items-center">
                  <span className="font-medium text-purple-600 mr-2">👑</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium text-teal-600 mr-2">📍</span> {user.location}
                </p>
                <p className="text-sm flex items-center">
                  <span className="font-medium text-gray-600 mr-2">●</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </p>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(user)}
                  className="group flex-1 bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-1"
                >
                  <span>✏️</span> Edit
                </button>
                <button
                  onClick={() => openDeleteModal(user)}
                  className="group flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-1"
                >
                  <span>🗑️</span> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/add_user')}
            className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>➕</span> Add New User
          </button>
        </div>

        {/* Edit User Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={selectedUser.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={selectedUser.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={selectedUser.role}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <select
                    name="location"
                    value={selectedUser.location}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={selectedUser.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={closeModal}
                  className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>❌</span> Cancel
                </button>
                <button
                  onClick={saveUser}
                  className="group bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>💾</span> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-indigo-600">{selectedUser.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>❌</span> Cancel
                </button>
                <button
                  onClick={deleteUser}
                  className="group bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>🗑️</span> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsersPage;