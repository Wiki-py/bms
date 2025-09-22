import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      location: 'Downtown Store',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Manager',
      status: 'Active',
      location: 'Uptown Store',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Staff',
      status: 'Inactive',
      location: 'Mall Outlet',
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'Cashier',
      status: 'Active',
      location: 'Downtown Store',
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      role: 'Manager',
      status: 'Active',
      location: 'Mall Outlet',
    },
  ]);

  // Sample locations for the dropdown
  const locations = ['Downtown Store', 'Uptown Store', 'Mall Outlet'];

  // Simulate fetching user data from an API
  useEffect(() => {
    // Replace with actual API call
    // Example: fetch('/api/users').then(res => res.json()).then(data => setUserData(data));
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
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handle form changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated user data
  const saveUser = () => {
    setUserData((prev) =>
      prev.map((user) => (user.id === selectedUser.id ? selectedUser : user))
    );
    closeModal();
    // In a real app, send updated user data to the backend
    // Example: fetch(`/api/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify(selectedUser) });
  };

  // Delete user
  const deleteUser = (id) => {
    setUserData((prev) => prev.filter((user) => user.id !== id));
    // In a real app, send delete request to the backend
    // Example: fetch(`/api/users/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-teal-100 to-indigo-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left text-indigo-800">
        Manage Users
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Users Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold mb-2 text-indigo-700">{user.name}</h2>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-teal-600">Email:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-teal-600">Role:</span> {user.role}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-teal-600">Location:</span> {user.location}
            </p>
            <p
              className={`text-sm font-medium ${
                user.status === 'Active' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Status: {user.status}
            </p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => openEditModal(user)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
              >
                Edit
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200 shadow"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/add_user')}
          className="w-full md:w-auto bg-amber-500 text-white py-3 px-6 rounded-lg text-base font-medium hover:bg-amber-600 transition-colors duration-200 shadow-md"
        >
          Add New User
        </button>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-800">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={selectedUser.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={selectedUser.role}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  name="location"
                  value={selectedUser.location}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={selectedUser.status}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={saveUser}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors duration-200 shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;