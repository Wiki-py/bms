import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://bms-api-2.onrender.com/api/auth';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getDefaultRoute = (userRole) => {
    const roleRoutes = {
      'Admin': '/dashboard',
      'Owner': '/dashboard', 
      'Manager': '/staff_dashboard',
      'Supervisor': '/staff_dashboard',
      'Staff': '/point-of-sale',
      'Cashier': '/point-of-sale',
      'Employee': '/point-of-sale'
    };
    
    return roleRoutes[userRole] || '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get JWT tokens
      const tokenResponse = await axios.post(`${API_BASE}/token/`, {
        username,
        password
      });

      const { access, refresh } = tokenResponse.data;

      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Get user profile
      const userResponse = await axios.get(`${API_BASE}/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      const currentUser = userResponse.data;
      
      // ✅ CRITICAL: Store user in localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Call parent callback if provided
      if (onLogin) onLogin(currentUser);
      
      // ✅ IMPROVED REDIRECT LOGIC
      console.log('🔍 LOGIN REDIRECT DEBUG:', {
        hasPreviousPath: !!location.state?.from?.pathname,
        previousPath: location.state?.from?.pathname,
        userRole: currentUser.role,
        userData: currentUser
      });

      let redirectPath;

      // Priority 1: Return to originally intended page
      if (location.state?.from?.pathname) {
        redirectPath = location.state.from.pathname;
        console.log('🎯 Redirecting to previously intended page:', redirectPath);
      } 
      // Priority 2: Role-based default route
      else {
        redirectPath = getDefaultRoute(currentUser.role);
        console.log('🎯 Redirecting to role-based default page:', redirectPath, 'for role:', currentUser.role);
      }

      // Final fallback
      if (!redirectPath) {
        console.warn('⚠️ No redirect path determined, using dashboard as fallback');
        redirectPath = '/dashboard';
      }

      console.log('🚀 Final redirect destination:', redirectPath);
      
      // Navigate to the determined path
      navigate(redirectPath, { replace: true });
      
    } catch (err) {
      console.error('Login error details:', err);
      console.error('Error response data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else if (err.response?.status === 404) {
        setError('Profile endpoint not found. Please check backend configuration.');
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-auto p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}
            
            <div className="flex flex-col">
              <label
                htmlFor="username"
                className="mb-2 font-semibold text-gray-700 text-sm sm:text-base"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                disabled={loading}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-2 font-semibold text-gray-700 text-sm sm:text-base"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg text-sm sm:text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Forgot your password?
            </a>
          </div>
        </div>
        
        {/* Demo credentials hint */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo credentials available in the documentation</p>
        </div>
      </div>
    </div>
  );
};

export default Login;