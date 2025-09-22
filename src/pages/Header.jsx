import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

function Header({ user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links array for reusability
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/employees', label: 'Employees' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/finance', label: 'Finance' },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl p-4 sm:p-6 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div className="text-3xl font-extrabold tracking-tight">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          BMS
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-white/90 text-lg font-medium hover:text-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-md px-2 py-1"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FaUserCircle className="text-white/80 text-2xl hover:text-white transition-colors" />
          <span className="text-white/90 font-medium hidden md:block">
            {user?.name || 'User'}
          </span>
        </div>
        <Link
          to="/logout"
          className="bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          Logout
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-md p-2 transition-colors"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav
        className={`md:hidden absolute top-16 left-0 w-full bg-gradient-to-b from-white to-gray-50 shadow-2xl flex flex-col p-6 space-y-4 transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-gray-800 text-lg font-medium hover:text-indigo-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-md px-2 py-1"
            onClick={toggleMobileMenu}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default Header;