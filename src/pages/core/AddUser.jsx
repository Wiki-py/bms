import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    location: 'Downtown Store',
    status: 'Active',
    phone: '',
    password: '',
    repeatPassword: '',
    passport: null,
  });
  const [errors, setErrors] = useState({});

  // Sample locations and roles to match ManageUsersPage
  const locations = ['Downtown Store', 'Uptown Store', 'Mall Outlet'];
  const roles = ['Admin', 'Manager', 'Staff', 'Cashier'];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Simulate adding user to backend
    const newUser = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID for demo
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      location: formData.location,
    };
    // In a real app, send to backend
    // fetch('/api/users', {
    //   method: 'POST',
    //   body: JSON.stringify(newUser),
    // }).then(() => navigate('/Users'));

    console.log('New User:', newUser); // For demo purposes
    navigate('/Users');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-indigo-800">
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
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
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
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
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

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter Phone Number"
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
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
              className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            />
            {errors.repeatPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/Users')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors duration-200 shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;