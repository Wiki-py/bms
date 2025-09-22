import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const navigate = useNavigate();
  // Sample user data
  const userData = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Staff', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', role: 'Cashier', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@example.com', role: 'Manager', status: 'Active' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Manage Users</h1>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Users Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userData.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">{user.name}</h2>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
            <p className={`text-sm ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
              Status: {user.status}
            </p>
            <div className="mt-3 flex space-x-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                Edit
              </button>
              <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add User Button - Full width on mobile */}
      <div className="mt-4">
        <button onClick={() => navigate('/add_user')} className="w-full md:w-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
          Add New User
        </button>
      </div>
    </div>
  );
};

export default ManageUsersPage;