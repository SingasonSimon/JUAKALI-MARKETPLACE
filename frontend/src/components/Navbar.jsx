import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';

export default function Navbar() {
  const { dbUser, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navLinkStyle = ({ isActive }) =>
    isActive ? 'text-blue-400 font-bold' : 'text-white hover:text-blue-300';

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      setMobileMenuOpen(false);
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setLogoutLoading(false);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 shadow-md border-b border-gray-700 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex items-center h-full"
          >
            <Link 
              to="/" 
              className="text-lg sm:text-xl font-bold text-white hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">JUAKALI MARKETPLACE</span>
              <span className="sm:hidden">JUAKALI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Show Home link - for logged-in users, it goes to dashboard */}
            {dbUser ? (
              <NavLink to="/dashboard" className={navLinkStyle} aria-label="Home">
                Home
              </NavLink>
            ) : (
              <NavLink to="/" className={navLinkStyle} aria-label="Home">
                Home
              </NavLink>
            )}

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
              <div className="flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {dbUser && (
              <LoadingButton
                onClick={handleLogout}
                loading={logoutLoading}
                variant="danger"
                className="py-1.5 px-3 text-xs"
                aria-label="Logout"
              >
                Logout
              </LoadingButton>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-gray-700"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              ref={menuRef}
            >
              <div className="pt-4 pb-2 space-y-2 border-t border-gray-700 mt-3">
                {dbUser ? (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-blue-400 font-bold bg-gray-700'
                          : 'text-white hover:text-blue-300 hover:bg-gray-700'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Home"
                  >
                    Home
                  </NavLink>
                ) : (
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-blue-400 font-bold bg-gray-700'
                          : 'text-white hover:text-blue-300 hover:bg-gray-700'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Home"
                  >
                    Home
                  </NavLink>
                )}

                {dbUser && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-blue-400 font-bold bg-gray-700'
                          : 'text-white hover:text-blue-300 hover:bg-gray-700'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Dashboard"
                  >
                    Dashboard
                  </NavLink>
                )}

                {!dbUser && (
                  <>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'text-blue-400 font-bold bg-gray-700'
                            : 'text-white hover:text-blue-300 hover:bg-gray-700'
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Login"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition rounded-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Register"
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
