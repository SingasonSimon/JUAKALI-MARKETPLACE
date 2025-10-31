import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * GuestRoute - Redirects logged-in users away from guest-only pages (like home)
 */
export default function GuestRoute({ children }) {
  const { dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (dbUser) {
    // User is logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is not logged in, show the guest page
  return children;
}

