import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('Please log in to view your profile.');
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div className="text-center text-gray-600">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        {error}
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>
        <div className="space-y-4">
          <p><strong>Name:</strong> {user.name || user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;