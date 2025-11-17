import apiClient from '../api/apiClient';

/**
 * Fetches a list of all users.
 * This will only succeed if the user is an ADMIN.
 */
const getAllUsers = async () => {
  try {
    const { data } = await apiClient.get('/admin/users/');
    return data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user details by ID
 */
const getUser = async (userId) => {
  try {
    const { data } = await apiClient.get(`/admin/users/${userId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user
 */
const updateUser = async (userId, userData) => {
  try {
    const { data } = await apiClient.patch(`/admin/users/${userId}/`, userData);
    return data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  try {
    await apiClient.delete(`/admin/users/${userId}/`);
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Activate or deactivate user
 */
const activateUser = async (userId) => {
  try {
    const { data } = await apiClient.post(`/admin/users/${userId}/activate/`);
    return data;
  } catch (error) {
    console.error("Error activating/deactivating user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Booking management helpers (admin only)
 */
const getAllBookings = async () => {
  try {
    const { data } = await apiClient.get('/bookings/');
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error.response?.data || error.message);
    throw error;
  }
};

const getBooking = async (bookingId) => {
  try {
    const { data } = await apiClient.get(`/bookings/${bookingId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error.response?.data || error.message);
    throw error;
  }
};

const updateBooking = async (bookingId, bookingData) => {
  try {
    const { data } = await apiClient.patch(`/bookings/${bookingId}/`, bookingData);
    return data;
  } catch (error) {
    console.error("Error updating booking:", error.response?.data || error.message);
    throw error;
  }
};

const deleteBooking = async (bookingId) => {
  try {
    await apiClient.delete(`/bookings/${bookingId}/`);
  } catch (error) {
    console.error("Error deleting booking:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update service (admin can update any service)
 */
const updateService = async (serviceId, serviceData) => {
  try {
    const { data } = await apiClient.patch(`/services/${serviceId}/`, serviceData);
    return data;
  } catch (error) {
    console.error("Error updating service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete service (admin can delete any service)
 */
const deleteService = async (serviceId) => {
  try {
    await apiClient.delete(`/services/${serviceId}/`);
  } catch (error) {
    console.error("Error deleting service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get analytics data
 */
const getAnalytics = async () => {
  try {
    const { data } = await apiClient.get('/admin/analytics/');
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get reports
 */
const getReports = async (reportType = 'activity') => {
  try {
    const { data } = await apiClient.get(`/admin/reports/?type=${reportType}`);
    return data;
  } catch (error) {
    console.error("Error fetching reports:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get admin action logs
 */
const getActionLogs = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const { data } = await apiClient.get(`/admin/action-logs/?${params.toString()}`);
    return data;
  } catch (error) {
    console.error("Error fetching action logs:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all complaints
 */
const getAllComplaints = async () => {
  try {
    const { data } = await apiClient.get('/complaints/');
    return data;
  } catch (error) {
    console.error("Error fetching complaints:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update complaint (admin only)
 */
const updateComplaint = async (complaintId, complaintData) => {
  try {
    const { data } = await apiClient.patch(`/complaints/${complaintId}/`, complaintData);
    return data;
  } catch (error) {
    console.error("Error updating complaint:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all reviews (admin only)
 */
const getAllReviews = async () => {
  try {
    const { data } = await apiClient.get('/reviews/');
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get review by ID (admin only)
 */
const getReview = async (reviewId) => {
  try {
    const { data } = await apiClient.get(`/reviews/${reviewId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching review:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update review (admin only)
 */
const updateReview = async (reviewId, reviewData) => {
  try {
    const { data } = await apiClient.patch(`/reviews/${reviewId}/`, reviewData);
    return data;
  } catch (error) {
    console.error("Error updating review:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete review (admin only)
 */
const deleteReview = async (reviewId) => {
  try {
    await apiClient.delete(`/reviews/${reviewId}/`);
  } catch (error) {
    console.error("Error deleting review:", error.response?.data || error.message);
    throw error;
  }
};

export const adminService = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  updateService,
  deleteService,
  getAnalytics,
  getReports,
  getActionLogs,
  getAllComplaints,
  updateComplaint,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
};