import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import { userService } from '../services/userService';

export default function Profile() {
  const { dbUser, setDbUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: dbUser?.first_name || '',
    last_name: dbUser?.last_name || '',
    email: dbUser?.email || '',
  });

  // Update form data when dbUser changes
  useEffect(() => {
    if (dbUser) {
      setFormData({
        first_name: dbUser.first_name || '',
        last_name: dbUser.last_name || '',
        email: dbUser.email || '',
      });
    }
  }, [dbUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      // Update the auth context with new user data
      setDbUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 rounded-lg p-8 mb-8 border border-gray-700">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {dbUser?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {dbUser?.first_name} {dbUser?.last_name}
            </h1>
            <p className="text-blue-200 mb-2">{dbUser?.email}</p>
            <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white">
              {dbUser?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Profile Information</h2>
          {!isEditing && (
            <LoadingButton
              onClick={() => setIsEditing(true)}
              className="px-6 py-2"
            >
              Edit Profile
            </LoadingButton>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
                disabled
              />
              <p className="text-gray-300 text-sm mt-1">Email cannot be changed</p>
            </div>
            <div className="flex gap-4">
              <LoadingButton
                type="submit"
                loading={loading}
                className="px-6 py-2"
              >
                Save Changes
              </LoadingButton>
              <LoadingButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    first_name: dbUser?.first_name || '',
                    last_name: dbUser?.last_name || '',
                    email: dbUser?.email || '',
                  });
                }}
                className="px-6 py-2"
              >
                Cancel
              </LoadingButton>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <p className="text-white text-lg">{dbUser?.first_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <p className="text-white text-lg">{dbUser?.last_name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <p className="text-white text-lg">{dbUser?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white">
                {dbUser?.role || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

