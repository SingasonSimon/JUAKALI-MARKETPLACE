import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { djangoAdminService } from '../services/djangoAdminService';

export default function DjangoAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [djangoAdminUser, setDjangoAdminUser] = useState(null);

  useEffect(() => {
    const checkDjangoAdminSession = async () => {
      try {
        // Check if user is authenticated via Django session
        const response = await djangoAdminService.checkSession();
        
        console.log('Django admin session check response:', response);
        
        if (response.authenticated && response.is_django_admin) {
          setIsAuthenticated(true);
          setDjangoAdminUser(response.user);
          // CSRF token is now stored in djangoAdminService automatically
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking Django admin session:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDjangoAdminSession();
    
    // Also set up a periodic check to refresh session status
    const interval = setInterval(checkDjangoAdminSession, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-gray-300 mb-6">
            Please log in to Django admin first to access this page.
          </p>
          <div className="space-y-3">
            <a
              href="http://localhost:8000/admin/login/?next=/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              Open Django Admin Login
            </a>
            <div className="mt-4 p-4 bg-gray-700 rounded text-left text-sm text-gray-300">
              <p className="font-semibold mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the button above to open Django admin</li>
                <li>Log in with: <span className="text-white font-mono">admin@gmail.com</span> / <span className="text-white font-mono">admin123</span></li>
                <li>After logging in, return here and refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render AdminLayout with nested routes
  if (!djangoAdminUser) {
    return null; // Wait for user to be loaded
  }
  
  return <AdminLayout djangoAdminUser={djangoAdminUser} />;
}

