import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    phone: '+256 123 456 7890', // Updated to Uganda phone format
    address: '123 Main St, Kampala, Uganda',
    location: 'Downtown Store',
    profilePicture: 'https://via.placeholder.com/150',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(profileData);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Sample locations to match ManageUsersPage and AddUser
  const locations = ['Downtown Store', 'Uptown Store', 'Mall Outlet'];

  // Simulate fetching profile data from an API
  useEffect(() => {
    // Replace with actual API call
    // fetch('/api/profile').then(res => res.json()).then(data => setProfileData(data));
  }, []);

  // Handle input changes for edit profile modal
  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle input changes for change password modal
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate edit profile form
  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) newErrors.name = 'Name is required';
    if (!editFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) newErrors.email = 'Invalid email format';
    if (!editFormData.phone.trim()) newErrors.phone = 'Phone is required';
    return newErrors;
  };

  // Validate change password form
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordFormData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordFormData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordFormData.newPassword !== passwordFormData.repeatPassword)
      newErrors.repeatPassword = 'Passwords do not match';
    return newErrors;
  };

  // Save profile changes
  const saveProfile = () => {
    const validationErrors = validateEditForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setProfileData({ ...editFormData });
    setIsEditModalOpen(false);
    setErrors({});
    // In a real app, send updated profile to backend
    // fetch('/api/profile', { method: 'PUT', body: JSON.stringify(editFormData) });
  };

  // Save password changes
  const savePassword = () => {
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // In a real app, send password change request to backend
    // fetch('/api/change-password', { method: 'POST', body: JSON.stringify(passwordFormData) });
    console.log('Password updated:', passwordFormData);
    setPasswordFormData({ currentPassword: '', newPassword: '', repeatPassword: '' });
    setIsPasswordModalOpen(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 max-w-lg mx-auto lg:w-1/2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-indigo-800">
            My Profile
          </h1>
          <div className="flex flex-col items-center mb-4">
            <img
              src={profileData.profilePicture}
              alt="Profile Picture"
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-teal-200 shadow-md"
            />
            <h2 className="text-xl font-semibold text-indigo-700">{profileData.name}</h2>
            <p className="text-sm text-gray-600">{profileData.role}</p>
            <p className="text-sm text-teal-600 font-medium">{profileData.location}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-teal-600">Email:</span> {profileData.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-teal-600">Phone:</span> {profileData.phone}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-teal-600">Address:</span> {profileData.address}
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-teal-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-amber-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200 shadow"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg text-base hover:bg-gray-400 transition-colors duration-200 shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-800">Edit Profile</h2>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">User Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter Name"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">User Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder="yourname@example.com"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  placeholder="Enter Phone Number"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  placeholder="Enter Address"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Location</label>
                <select
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/jpeg,image/png"
                  onChange={handleEditInputChange}
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setErrors({});
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors duration-200 shadow"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200 shadow"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-800">Change Password</h2>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter Current Password"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter New Password"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-700">Repeat New Password</label>
                <input
                  type="password"
                  name="repeatPassword"
                  value={passwordFormData.repeatPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Repeat New Password"
                  className="p-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
                />
                {errors.repeatPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setErrors({});
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors duration-200 shadow"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={savePassword}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors duration-200 shadow"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;