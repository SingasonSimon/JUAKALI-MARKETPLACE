import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import FormInput from '../components/FormInput';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import apiClient from '../api/apiClient';

export default function Settings() {
  const { dbUser, firebaseUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Load email_notifications preference from backend
  useEffect(() => {
    if (dbUser && dbUser.email_notifications !== undefined) {
      setNotificationsEnabled(dbUser.email_notifications);
    }
  }, [dbUser]);

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Create a JSON export of user data
      const exportData = {
        profile: {
          name: `${dbUser?.first_name} ${dbUser?.last_name}`,
          email: dbUser?.email,
          role: dbUser?.role,
        },
        exportDate: new Date().toISOString(),
        note: 'This is a data export from Juakali Marketplace',
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `juakali-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    if (!firebaseUser) {
      showToast('You must be logged in to change your password', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      // Re-authenticate user (Firebase requires this for password change)
      const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordForm.newPassword);
      
      showToast('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
        setPasswordErrors({ currentPassword: 'Incorrect password' });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
        setPasswordErrors({ newPassword: 'Password is too weak' });
      } else {
        errorMessage = error.message || errorMessage;
      }
      showToast(errorMessage, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsLoading(true);
    
    try {
      // Update preference on backend
      const response = await apiClient.patch('/users/me/', {
        email_notifications: newValue
      });
      
      // Update local state
      setNotificationsEnabled(newValue);
      
      // Refresh user data in auth context
      if (refreshUser) {
        await refreshUser();
      }
      
      showToast(
        `Email notifications ${newValue ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      console.error('Failed to update email notifications:', error);
      showToast(
        'Failed to update email notifications preference',
        'error'
      );
      // Revert toggle on error
      setNotificationsEnabled(!newValue);
    } finally {
      setNotificationsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 rounded-lg p-8 border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-blue-200">Manage your account preferences</p>
      </div>

      {/* Account Settings */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-white font-semibold">Email</h3>
              <p className="text-gray-300 text-sm">{dbUser?.email}</p>
            </div>
            <span className="text-gray-400 text-sm">Cannot be changed</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-white font-semibold">Role</h3>
              <p className="text-gray-300 text-sm">{dbUser?.role}</p>
            </div>
            <span className="text-gray-400 text-sm">Cannot be changed</span>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
        <div className="space-y-6">
          {/* Password Change */}
          <div className="p-6 bg-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormInput
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={passwordErrors.currentPassword}
                required
                disabled={passwordLoading}
              />
              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={passwordErrors.newPassword}
                required
                disabled={passwordLoading}
                placeholder="Minimum 6 characters"
              />
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={passwordErrors.confirmPassword}
                required
                disabled={passwordLoading}
              />
              <LoadingButton
                type="submit"
                loading={passwordLoading}
                className="px-6 py-2"
              >
                Update Password
              </LoadingButton>
            </form>
          </div>

          {/* Data Export */}
          <div className="p-6 bg-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Data Export</h3>
            <p className="text-gray-300 text-sm mb-4">
              Download a copy of your account data including profile information.
            </p>
            <LoadingButton
              onClick={handleExportData}
              loading={loading}
              variant="outline"
              className="px-6 py-2"
            >
              Export My Data
            </LoadingButton>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-white font-semibold">Email Notifications</h3>
              <p className="text-gray-300 text-sm">Receive updates about your bookings and services</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                disabled={notificationsLoading}
              />
              <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

