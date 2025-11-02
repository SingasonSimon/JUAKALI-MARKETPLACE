import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import { djangoAdminService } from '../services/djangoAdminService';
import { adminService } from '../services/adminService';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';

export default function AdminProfile() {
  const { djangoAdminUser } = useOutletContext();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    first_name: djangoAdminUser?.first_name || '',
    last_name: djangoAdminUser?.last_name || '',
    email: djangoAdminUser?.email || '',
  });

  // Update form data when djangoAdminUser changes
  useEffect(() => {
    if (djangoAdminUser) {
      setFormData({
        first_name: djangoAdminUser.first_name || '',
        last_name: djangoAdminUser.last_name || '',
        email: djangoAdminUser.email || '',
      });
    }
  }, [djangoAdminUser]);

  // Fetch booking history (all bookings for admin)
  useEffect(() => {
    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const data = await djangoAdminService.getAllBookings();
        // Sort by booking date (newest first)
        const sortedBookings = data.sort((a, b) => 
          new Date(b.booking_date) - new Date(a.booking_date)
        );
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        showToast('Failed to load booking history', 'error');
      } finally {
        setBookingsLoading(false);
      }
    };

    if (djangoAdminUser) {
      fetchBookings();
    }
  }, [djangoAdminUser, showToast]);

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
      const updatedUser = await djangoAdminService.updateUser(djangoAdminUser.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      // Reload page to get updated user data
      window.location.reload();
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
            {djangoAdminUser?.first_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              {djangoAdminUser?.first_name} {djangoAdminUser?.last_name}
              <ShieldCheckIcon className="w-6 h-6 text-blue-300" />
            </h1>
            <p className="text-blue-200 mb-2">{djangoAdminUser?.email}</p>
            <span className="inline-block px-3 py-1 bg-red-600 rounded-full text-sm font-semibold text-white">
              ADMIN
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
                    first_name: djangoAdminUser?.first_name || '',
                    last_name: djangoAdminUser?.last_name || '',
                    email: djangoAdminUser?.email || '',
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
                <p className="text-white text-lg">{djangoAdminUser?.first_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <p className="text-white text-lg">{djangoAdminUser?.last_name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <p className="text-white text-lg">{djangoAdminUser?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <span className="inline-block px-3 py-1 bg-red-600 rounded-full text-sm font-semibold text-white">
                ADMIN
              </span>
            </div>
          </div>
        )}
      </div>

      {/* All Bookings Section (Admin can see all bookings) */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg mt-8">
        <div className="flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">All Bookings</h2>
          <span className="ml-auto px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>

        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded-lg p-4 h-32"></div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-300 mb-2 font-semibold text-lg">No bookings yet</p>
            <p className="text-gray-400 text-sm">Booking history will appear here once users make bookings.</p>
          </div>
        ) : (
          <>
            {/* Paginated Bookings List */}
            <div className="space-y-4">
              {(() => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedBookings = bookings.slice(startIndex, endIndex);

                return paginatedBookings.map((booking, index) => {
                  const bookingDate = new Date(booking.booking_date);
                  const statusColors = {
                    'PENDING': 'bg-yellow-900 text-yellow-300 border-yellow-700',
                    'CONFIRMED': 'bg-green-900 text-green-300 border-green-700',
                    'CANCELED': 'bg-red-900 text-red-300 border-red-700',
                    'COMPLETED': 'bg-blue-900 text-blue-300 border-blue-700',
                  };

                  const statusIcons = {
                    'PENDING': ClockIcon,
                    'CONFIRMED': CheckCircleIcon,
                    'CANCELED': XCircleIcon,
                    'COMPLETED': CheckCircleIcon,
                  };

                  const StatusIcon = statusIcons[booking.status] || ClockIcon;

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-5 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {booking.service_details?.title || 'Service'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusColors[booking.status] || 'bg-gray-600 text-gray-300 border-gray-500'}`}>
                              <StatusIcon className="w-4 h-4" />
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <CalendarIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span>
                                <span className="font-semibold">Date:</span>{' '}
                                {bookingDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <ClockIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span>
                                <span className="font-semibold">Time:</span>{' '}
                                {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {booking.seeker_details && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-semibold">Seeker:</span>{' '}
                                {booking.seeker_details.first_name}{' '}
                                {booking.seeker_details.last_name} ({booking.seeker_details.email})
                              </div>
                            )}
                            {booking.service_details?.provider_details && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-semibold">Provider:</span>{' '}
                                {booking.service_details.provider_details.first_name}{' '}
                                {booking.service_details.provider_details.last_name}
                              </div>
                            )}
                            {booking.service_details?.price && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-semibold">Price:</span>{' '}
                                <span className="text-blue-400 font-bold">
                                  KES {parseFloat(booking.service_details.price).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 text-xs text-gray-400">
                            Booked on: {new Date(booking.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>

            {/* Pagination */}
            {bookings.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(bookings.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={bookings.length}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

