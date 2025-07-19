import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaTools } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    if (user?.role === 'barber') {
      navigate('/barber-dashboard');
    } else {
      navigate('/dashboard');
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">BarberConnect</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleDashboardClick}
                  className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <Link to="/appointments" className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Appointments
                </Link>
                {user?.role === 'barber' && (
                  <Link to="/services" className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <FaTools className="mr-1" />
                    Services
                  </Link>
                )}
                <Link to="/profile" className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-secondary-600 text-sm">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              to="/"
              className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleDashboardClick}
                  className="text-secondary-700 hover:text-primary-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </button>
                <Link
                  to="/appointments"
                  className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Appointments
                </Link>
                {user?.role === 'barber' && (
                  <Link
                    to="/services"
                    className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaTools className="mr-2" />
                    Services
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <div className="border-t border-secondary-200 pt-4">
                  <div className="px-3 py-2 text-secondary-600 text-sm">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 