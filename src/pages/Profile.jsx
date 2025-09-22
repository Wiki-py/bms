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
  const [editFormData, setEditFormData] = useState({ ...profileData });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(profileData.profilePicture);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Sample locations to match ManageUsersPage and AddUser
  const locations = ['Downtown Store', 'Uptown Store', 'Mall Outlet'];

  // Simulate fetching profile data from an API
  useEffect(() => {
    // Replace with actual API call
    // fetch('/api/profile').then(res => res.json()).then(data => setProfileData(data));
    setEditFormData({ ...profileData });
    setLogoPreview(profileData.profilePicture);
  }, []);

  // Handle input changes for edit profile modal
  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setEditFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle input changes for change password modal
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      // Simple password strength calculation
      const strength = value.length > 8 && /[A-Z]/.test(value) && /\d/.test(value) ? 3 : value.length > 6 ? 2 : value.length > 0 ? 1 : 0;
      setPasswordStrength(strength);
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate edit profile form
  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) newErrors.name = 'Name is required';
    if (!editFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) newErrors.email = 'Invalid email format';
    if (!editFormData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(editFormData.phone)) newErrors.phone = 'Invalid phone format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate change password form
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordFormData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordFormData.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordFormData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordFormData.newPassword !== passwordFormData.repeatPassword) newErrors.repeatPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile changes
  const saveProfile = async () => {
    if (!validateEditForm()) return;
    // Handle file upload if new profile picture
    if (editFormData.profilePicture instanceof File) {
      // Simulate upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...editFormData, profilePicture: reader.result });
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(editFormData.profilePicture);
    } else {
      setProfileData({ ...editFormData });
    }
    setIsEditModalOpen(false);
    setErrors({});
    // In a real app, send updated profile to backend
    // fetch('/api/profile', { method: 'PUT', body: JSON.stringify(editFormData) });
  };

  // Save password changes
  const savePassword = async () => {
    if (!validatePasswordForm()) return;
    // In a real app, send password change request to backend
    // fetch('/api/change-password', { method: 'POST', body: JSON.stringify(passwordFormData) });
    console.log('Password updated:', passwordFormData);
    setPasswordFormData({ currentPassword: '', newPassword: '', repeatPassword: '' });
    setPasswordStrength(0);
    setIsPasswordModalOpen(false);
    setErrors({});
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 3: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 1: return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 md:p-8">
            <div className="flex flex-col items-center mb-6">
              <img
                src={profileData.profilePicture}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gradient-to-r from-teal-200 to-indigo-200 shadow-lg ring-4 ring-white/50"
              />
              <h2 className="text-2xl font-bold text-indigo-800">{profileData.name}</h2>
              <p className="text-lg text-purple-600 font-semibold">{profileData.role}</p>
              <p className="text-sm text-teal-600 mt-2">{profileData.location}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 p-4 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl">
                <p className="font-medium text-teal-700">Email</p>
                <p className="text-gray-700">{profileData.email}</p>
              </div>
              <div className="space-y-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="font-medium text-purple-700">Phone</p>
                <p className="text-gray-700">{profileData.phone}</p>
              </div>
              <div className="space-y-2 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl md:col-span-2">
                <p className="font-medium text-indigo-700">Address</p>
                <p className="text-gray-700">{profileData.address}</p>
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="group bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>✏️</span> Edit Profile
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>🔒</span> Change Password
              </button>
            </div>
          </div>

          {/* Recent Activity or Stats Sidebar */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-indigo-800">Recent Activity</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg">
                <span className="text-teal-600">📊</span>
                <span>Updated sales report</span>
                <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
              </li>
              <li className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                <span className="text-indigo-600">🛒</span>
                <span>Processed order #123</span>
                <span className="ml-auto text-xs text-gray-500">1 day ago</span>
              </li>
              <li className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600">👥</span>
                <span>Added new employee</span>
                <span className="ml-auto text-xs text-gray-500">3 days ago</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-8 rounded-xl text-base font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>🏠</span> Back to Dashboard
          </button>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Edit Profile</h2>
              <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">User Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Enter Name"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">User Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    placeholder="yourname@example.com"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    placeholder="Enter Phone Number"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.phone 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    placeholder="Enter Address"
                    className="p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Location</label>
                  <select
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                    className="p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/jpeg,image/png"
                    onChange={handleEditInputChange}
                    className="p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Preview" 
                      className="mt-2 w-20 h-20 object-cover rounded-lg mx-auto" 
                    />
                  )}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setErrors({});
                      setLogoPreview(profileData.profilePicture);
                    }}
                    className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>❌</span> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="group bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>💾</span> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Change Password</h2>
              <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter Current Password"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.currentPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-amber-500'
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter New Password"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.newPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-amber-500'
                    }`}
                  />
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                  {/* Password Strength Indicator */}
                  {passwordFormData.newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs capitalize">
                        {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength] || 'None'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700">Repeat New Password</label>
                  <input
                    type="password"
                    name="repeatPassword"
                    value={passwordFormData.repeatPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Repeat New Password"
                    className={`p-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.repeatPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-amber-500'
                    }`}
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
                      setPasswordStrength(0);
                    }}
                    className="group bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>❌</span> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePassword}
                    className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>💾</span> Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;