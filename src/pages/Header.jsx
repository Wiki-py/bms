import { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'; // Icons for user and mobile menu

function Header({ user }) {
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600">
        <Link to="/">BMS</Link>
      </div>

      {/* Desktop Navigation */}
      

      {/* User Profile */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FaUserCircle className="text-gray-600 text-2xl" />
          <span className="text-gray-600 hidden md:block">
            {user?.name || 'User'}
          </span>
        </div>
        <Link
          to="/logout"
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-gray-600 focus:outline-none"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full bg-white shadow-md flex flex-col p-4 space-y-4">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-blue-500"
            onClick={toggleMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/employees"
            className="text-gray-600 hover:text-blue-500"
            onClick={toggleMobileMenu}
          >
            Employees
          </Link>
          <Link
            to="/inventory"
            className="text-gray-600 hover:text-blue-500"
            onClick={toggleMobileMenu}
          >
            Inventory
          </Link>
          <Link
            to="/finance"
            className="text-gray-600 hover:text-blue-500"
            onClick={toggleMobileMenu}
          >
            Finance
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;