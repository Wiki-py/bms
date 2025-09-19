import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUsers, FaBox, FaDollarSign, FaCashRegister, FaFileAlt, FaShoppingCart, FaUser, FaCog, FaUserCircle, FaBusinessTime } from 'react-icons/fa';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar visibility for mobile
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/staff_dashboard', label: 'Staff Dashboard', icon: <FaBusinessTime /> },
    { path: '/point-of-sale', label: 'Point of sale', icon: <FaCashRegister /> },
    { path: '/products', label: 'Products', icon: <FaShoppingCart /> },
    { path: '/reports', label: 'Reports', icon: <FaFileAlt /> },
    { path: '/inventory', label: 'Inventory', icon: <FaBox /> },
    { path: '/users', label: 'Users', icon : <FaUser /> },
    { path: '/my_profile', label: 'My Profile', icon: <FaUserCircle /> },
    { path: '/business_settings', label: 'Business Settings', icon: <FaCog /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button - Positioned in top left corner */}
      <button
        className="fixed top-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg focus:outline-none md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">BMS Menu</h2>
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            onClick={toggleSidebar}
          >
            <FaTimes size={20} />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`
              }
              onClick={() => setIsOpen(false)} // Close sidebar on mobile click
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-grey bg-opacity-5 md:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;