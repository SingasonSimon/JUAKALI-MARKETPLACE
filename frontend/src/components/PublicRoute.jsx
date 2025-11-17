import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

/**
 * PublicRoute - Redirects logged-in users away from public pages (login/register)
 */
export default function PublicRoute({ children }) {
  const { dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (dbUser) {
    // User is already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is not logged in, show the public page
  return children;
}

