import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Add loading state for better UX

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/token/', {  // Your Django token URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,  // If using email auth; else change to 'username: email'
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store tokens for use in other components (e.g., AddProductPage)
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        console.log('Login successful! Tokens stored.');  // For debugging
        if (onLogin) onLogin();  // Call parent callback if provided
        navigate('/dashboard', { replace: true });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid email or password');  // Backend error msg
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 sm:my-6 md:my-8 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-800">
        Login
      </h1>
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {error && (
            <p className="text-xs sm:text-sm md:text-base text-red-600 text-center">{error}</p>
          )}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="mb-1 font-semibold text-gray-700 text-xs sm:text-sm md:text-base"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
              className="p-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-1 font-semibold text-gray-700 text-xs sm:text-sm md:text-base"
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
              className="p-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md text-xs sm:text-sm md:text-base mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;