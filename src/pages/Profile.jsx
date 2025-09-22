import React from 'react';

const MyProfilePage = () => {
  // Sample user profile data
  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    phone: '+1 (123) 456-7890',
    address: '123 Main St, City, Country',
    profilePicture: 'https://via.placeholder.com/150', // Placeholder image
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">My Profile</h1>
      
      {/* Profile Card */}
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-4">
          <img
            src={profileData.profilePicture}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-semibold">{profileData.name}</h2>
          <p className="text-sm text-gray-600">{profileData.role}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600"><strong>Email:</strong> {profileData.email}</p>
          <p className="text-sm text-gray-600"><strong>Phone:</strong> {profileData.phone}</p>
          <p className="text-sm text-gray-600"><strong>Address:</strong> {profileData.address}</p>
        </div>
        
        {/* Edit Button */}
        <div className="mt-6">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;