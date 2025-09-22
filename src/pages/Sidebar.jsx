import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUsers, FaBox, FaDollarSign, FaCashRegister, FaFileAlt, FaShoppingCart, FaUser, FaCog, FaUserCircle, FaBusinessTime } from 'react-icons/fa';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome className="w-5 h-5" /> },
    { path: '/staff_dashboard', label: 'Staff Dashboard', icon: <FaBusinessTime className="w-5 h-5" /> },
    { path: '/point-of-sale', label: 'Point of Sale', icon: <FaCashRegister className="w-5 h-5" /> },
    { path: '/products', label: 'Products', icon: <FaShoppingCart className="w-5 h-5" /> },
    { path: '/reports', label: 'Reports', icon: <FaFileAlt className="w-5 h-5" /> },
    { path: '/inventory', label: 'Inventory Report', icon: <FaBox className="w-5 h-5" /> },
    { path: '/users', label: 'Users', icon: <FaUser className="w-5 h-5" /> },
    { path: '/my_profile', label: 'My Profile', icon: <FaUserCircle className="w-5 h-5" /> },
    { path: '/business_settings', label: 'Business Settings', icon: <FaCog className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all md:hidden"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-2xl`}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold tracking-tight">BMS Menu</h2>
          <button
            className="md:hidden text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-md p-2 transition-colors"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
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
                `flex items-center space-x-3 p-3 rounded-xl ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'text-white/80 hover:bg-gray-700 hover:text-white'
                } transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}

export default Sidebar;