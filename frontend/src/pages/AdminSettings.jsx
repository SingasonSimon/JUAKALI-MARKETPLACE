import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import FormInput from '../components/FormInput';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { djangoAdminService } from '../services/djangoAdminService';

export default function AdminSettings() {
  const { djangoAdminUser } = useOutletContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load email_notifications preference from backend
  useEffect(() => {
    if (djangoAdminUser && djangoAdminUser.email_notifications !== undefined) {
      setNotificationsEnabled(djangoAdminUser.email_notifications);
    }
  }, [djangoAdminUser]);

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Create a JSON export of admin data
      const exportData = {
        profile: {
          name: `${djangoAdminUser?.first_name} ${djangoAdminUser?.last_name}`,
          email: djangoAdminUser?.email,
          role: 'ADMIN',
        },
        exportDate: new Date().toISOString(),
        note: 'This is a data export from Juakali Marketplace Admin Panel',
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `juakali-admin-data-export-${new Date().toISOString().split('T')[0]}.json`;
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

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsLoading(true);
    
    try {
      // Update preference on backend using the current user endpoint
      await djangoAdminService.updateCurrentUser({
        email_notifications: newValue
      });
      
      // Update local state
      setNotificationsEnabled(newValue);
      
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
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
          Settings
          <ShieldCheckIcon className="w-8 h-8 text-blue-300" />
        </h1>
        <p className="text-blue-200">Manage your admin account preferences</p>
      </div>

      {/* Account Settings */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-white font-semibold">Email</h3>
              <p className="text-gray-300 text-sm">{djangoAdminUser?.email}</p>
            </div>
            <span className="text-gray-400 text-sm">Cannot be changed</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-white font-semibold">Role</h3>
              <p className="text-gray-300 text-sm flex items-center gap-2">
                ADMIN
                <ShieldCheckIcon className="w-4 h-4 text-red-400" />
              </p>
            </div>
            <span className="text-gray-400 text-sm">Cannot be changed</span>
          </div>
        </div>
      </div>

      {/* Admin Note */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Information</h2>
        <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
          <p className="text-gray-300 text-sm">
            You are logged in as a Django admin user. Password changes and account modifications 
            should be done through the Django admin interface at{' '}
            <a 
              href="http://localhost:8000/admin/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              http://localhost:8000/admin/
            </a>
          </p>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
        <div className="space-y-6">
          {/* Data Export */}
          <div className="p-6 bg-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Data Export</h3>
            <p className="text-gray-300 text-sm mb-4">
              Download a copy of your admin account data including profile information.
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
              <p className="text-gray-300 text-sm">Receive updates about platform activity and admin tasks</p>
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

