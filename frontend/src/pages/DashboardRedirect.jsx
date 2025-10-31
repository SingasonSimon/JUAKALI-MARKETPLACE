import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import SeekerDashboard from './SeekerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRedirect() {
  const { dbUser } = useAuth();

  if (!dbUser) {
    // This should theoretically be caught by ProtectedRoute, but as a safeguard:
    return <Navigate to="/login" replace />;
  }

  // Check the role from our Django DB and render the correct dashboard
  switch (dbUser.role) {
    case 'SEEKER':
      return <SeekerDashboard />;
    case 'PROVIDER':
      return <ProviderDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      // If role is unknown, log them out or send to login
      console.error("Unknown user role:", dbUser.role);
      return <Navigate to="/login" replace />;
  }
}