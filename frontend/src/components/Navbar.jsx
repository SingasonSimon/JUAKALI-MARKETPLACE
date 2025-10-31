import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';

export default function Navbar() {
  const { dbUser, logout } = useAuth();
  const { showToast } = useToast();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navLinkStyle = ({ isActive }) =>
    isActive ? 'text-blue-400 font-bold' : 'text-white hover:text-blue-300';

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 shadow-md border-b border-gray-700 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="flex items-center h-full"
        >
          <Link to="/" className="text-xl font-bold text-white hover:text-blue-300 transition-colors whitespace-nowrap">
            JUAKALI MARKETPLACE
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <NavLink to="/" className={navLinkStyle} aria-label="Home">
            Home
          </NavLink>

          {/* Show Dashboard link only if logged in */}
          {dbUser && (
            <NavLink to="/dashboard" className={navLinkStyle} aria-label="Dashboard">
              Dashboard
            </NavLink>
          )}

          {/* Show Login/Register or Logout Button */}
          {dbUser ? (
            <LoadingButton
              onClick={handleLogout}
              loading={logoutLoading}
              variant="danger"
              className="py-2 px-4 text-sm"
              aria-label="Logout"
            >
              Logout
            </LoadingButton>
          ) : (
            <div className="flex items-center space-x-3 md:space-x-4">
              <NavLink to="/login" className={navLinkStyle} aria-label="Login">
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition rounded-lg"
                aria-label="Register"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
