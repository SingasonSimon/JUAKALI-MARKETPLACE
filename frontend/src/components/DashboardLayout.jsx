import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';

export default function DashboardLayout() {
  const { dbUser, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  // Helper function to capitalize names
  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = `${capitalizeName(dbUser?.first_name)} ${capitalizeName(dbUser?.last_name)}`.trim();
  const navigate = useNavigate();
  
  // Get initial sidebar state from localStorage or default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Collapsed state for desktop (icon-only mode)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const profileMenuRef = useRef(null);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      showToast('Logout failed', 'error');
    } finally {
      setLogoutLoading(false);
      setShowProfileMenu(false);
    }
  };

  const role = dbUser?.role || 'SEEKER';
  const isProvider = role === 'PROVIDER';
  // const isAdmin = role === 'ADMIN'; // ADMIN FUNCTIONALITY DISABLED

  // Navigation items based on role
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', Icon: ChartBarIcon },
    { path: '/dashboard/profile', label: 'Profile', Icon: UserIcon },
    { path: '/dashboard/settings', label: 'Settings', Icon: Cog6ToothIcon },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Toggle sidebar (mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle collapsed state (desktop)
  const toggleCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      if (desktop) {
        // On desktop, ensure sidebar is always visible (but can be collapsed)
        setSidebarOpen(true);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

  return (
    <div className="min-h-screen bg-gray-900 flex relative">
      {/* Sidebar - Always fixed, sticky on scroll */}
      <aside
        className={`${sidebarWidth} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 shadow-xl fixed h-screen z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
            {/* Logo */}
            <div className={`${sidebarCollapsed ? 'p-3' : 'p-4'} border-b border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50`}>
              <Link to="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} hover:opacity-80 transition-opacity`}>
                {!sidebarCollapsed && (
                  <span className="text-xl font-bold text-white whitespace-nowrap">Juakali Marketplace</span>
                )}
                {sidebarCollapsed && (
                  <span className="text-xl font-bold text-white">JM</span>
                )}
              </Link>
            </div>

            {/* Profile Section */}
            <div className={`p-4 border-b border-gray-700 ${sidebarCollapsed ? 'px-2' : ''}`}>
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} mb-3`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {dbUser?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {displayName || 'User'}
                    </p>
                    <p className="text-gray-300 text-sm truncate">{dbUser?.email}</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                    {role}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-2' : 'p-4'} hide-scrollbar`}>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg transition-colors group relative ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <item.Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                      )}
                      {sidebarCollapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom Actions */}
            <div className={`p-4 border-t border-gray-700 ${sidebarCollapsed ? 'px-2' : ''}`}>
              {sidebarCollapsed ? (
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="w-full py-2 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center"
                  title="Logout"
                >
                  {logoutLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <LoadingButton
                  onClick={handleLogout}
                  loading={logoutLoading}
                  variant="danger"
                  className="w-full py-2 px-4 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </LoadingButton>
              )}
              
              {/* Collapse Toggle Button (Desktop only) */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex w-full mt-2 py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors items-center justify-center gap-2 text-sm"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  )}
                </svg>
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
            </div>
      </aside>

      {/* Main Content - Adjust margin based on sidebar state */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-hidden"
        style={{
          marginLeft: isDesktop 
            ? (sidebarCollapsed ? '80px' : '256px') 
            : '0'
        }}
      >
        {/* Top Bar - Sticky header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Desktop collapse button */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              aria-label="Toggle sidebar collapse"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              {isActive('/dashboard/profile') && 'Profile'}
              {isActive('/dashboard/settings') && 'Settings'}
              {location.pathname === '/dashboard' && 'Dashboard'}
            </h1>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                {dbUser?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-white font-medium hidden sm:block truncate max-w-[120px]">
                {displayName || 'User'}
              </span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-white font-semibold">{displayName || 'User'}</p>
                    <p className="text-gray-300 text-sm">{dbUser?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      View Profile
                    </div>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 hide-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile - only show when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

