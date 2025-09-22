import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      location: 'Downtown Store',
      avatar: 'https://via.placeholder.com/40/4F46E5/FFFFFF?text=JD',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Manager',
      status: 'Active',
      location: 'Uptown Store',
      avatar: 'https://via.placeholder.com/40/EC4899/FFFFFF?text=JS',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Staff',
      status: 'Inactive',
      location: 'Mall Outlet',
      avatar: 'https://via.placeholder.com/40/F59E0B/FFFFFF?text=BJ',
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'Cashier',
      status: 'Active',
      location: 'Downtown Store',
      avatar: 'https://via.placeholder.com/40/10B981/FFFFFF?text=AB',
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      role: 'Manager',
      status: 'Active',
      location: 'Mall Outlet',
      avatar: 'https://via.placeholder.com/40/8B5CF6/FFFFFF?text=CW',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sample locations for the dropdown
  const locations = ['Downtown Store', 'Uptown Store', 'Mall Outlet'];
  const roles = ['Admin', 'Manager', 'Staff', 'Cashier'];

  // Simulate fetching user data from an API
  useEffect(() => {
    setLoading(true);
    // Replace with actual API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
  const saveUser = () => {
    if (!validateForm()) return;
    setUserData((prev) =>
      prev.map((user) => (user.id === selectedUser.id ? selectedUser : user))
    );
    closeModal();
    // In a real app, send updated user data to the backend
    // Example: fetch(`/api/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify(selectedUser) });
  };

  // Delete user
  const deleteUser = () => {
    if (selectedUser) {
      setUserData((prev) => prev.filter((user) => user.id !== selectedUser.id));
      closeDeleteModal();
      // In a real app, send delete request to the backend
      // Example: fetch(`/api/users/${selectedUser.id}`, { method: 'DELETE' });
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

        {/* Users Cards - Responsive grid */}
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
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
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
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
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
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold text-indigo-600">{selectedUser.name}</span>? This action cannot be undone.</p>
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