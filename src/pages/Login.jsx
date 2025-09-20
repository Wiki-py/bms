import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@inventoryapp.com' && password === 'password123') {
      onLogin();
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid email or password');
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
              className="p-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
              className="p-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md text-xs sm:text-sm md:text-base mt-3 sm:mt-4"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;