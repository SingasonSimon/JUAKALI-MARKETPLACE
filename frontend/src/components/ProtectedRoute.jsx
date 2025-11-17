import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const { dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" text="Loading..." />
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