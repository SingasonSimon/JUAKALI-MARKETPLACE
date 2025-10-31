import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
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

  if (!dbUser) {
    // User is not logged in or not synced
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render child routes
  return <Outlet />;
}