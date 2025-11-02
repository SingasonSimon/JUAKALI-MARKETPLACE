import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRedirect from './pages/DashboardRedirect';
import ServiceDetail from './pages/ServiceDetail';
import DjangoAdminPage from './pages/DjangoAdminPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminSettings from './pages/AdminSettings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import GuestRoute from './components/GuestRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

/**
 * A layout component to wrap pages that share the Navbar and Footer.
 */
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Child routes will render here */}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes inside the main layout */}
          <Route path="/" element={<MainLayout />}>
            <Route 
              index 
              element={<Home />}
            />
            <Route 
              path="login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route path="services/:id" element={<ServiceDetail />} />
          </Route>

          {/* Django Admin Routes (for Django admin users via session) */}
          <Route path="/admin" element={<DjangoAdminPage />}>
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Protected Dashboard Route */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={<DashboardLayout />}
            >
              <Route index element={<DashboardRedirect />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}