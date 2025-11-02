import axios from 'axios';

/**
 * Special API client for Django admin users
 * This makes direct requests to Django backend to ensure session cookies work
 */
const djangoAdminApiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Include cookies for Django session authentication
});

// Store CSRF token
let csrfToken = null;

// Function to get CSRF token from cookies
const getCsrfTokenFromCookie = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
};

// Interceptor to add CSRF token to requests
djangoAdminApiClient.interceptors.request.use(
  (config) => {
    // For POST, PUT, PATCH, DELETE requests, add CSRF token
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      // Try to get CSRF token from stored value, cookie, or use the one from session check
      const token = csrfToken || getCsrfTokenFromCookie();
      if (token) {
        config.headers['X-CSRFToken'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Check Django admin session and get CSRF token
 */
const checkSession = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/django-admin/session/');
    // Store CSRF token if provided
    if (data.csrf_token) {
      csrfToken = data.csrf_token;
    }
    return data;
  } catch (error) {
    console.error("Error checking Django admin session:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Admin endpoints using Django session auth
 */
const getAllUsers = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/admin/users/');
    return data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

const getUser = async (userId) => {
  try {
    const { data } = await djangoAdminApiClient.get(`/admin/users/${userId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching user:", error.response?.data || error.message);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/admin/users/${userId}/`, userData);
    return data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    await djangoAdminApiClient.delete(`/admin/users/${userId}/`);
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

const activateUser = async (userId) => {
  try {
    const { data } = await djangoAdminApiClient.post(`/admin/users/${userId}/activate/`);
    return data;
  } catch (error) {
    console.error("Error activating/deactivating user:", error.response?.data || error.message);
    throw error;
  }
};

const getAllBookings = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/bookings/');
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error.response?.data || error.message);
    throw error;
  }
};

const updateService = async (serviceId, serviceData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/services/${serviceId}/`, serviceData);
    return data;
  } catch (error) {
    console.error("Error updating service:", error.response?.data || error.message);
    throw error;
  }
};

const deleteService = async (serviceId) => {
  try {
    await djangoAdminApiClient.delete(`/services/${serviceId}/`);
  } catch (error) {
    console.error("Error deleting service:", error.response?.data || error.message);
    throw error;
  }
};

const getAnalytics = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/admin/analytics/');
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error.response?.data || error.message);
    throw error;
  }
};

const getReports = async (reportType = 'activity') => {
  try {
    const { data } = await djangoAdminApiClient.get(`/admin/reports/?type=${reportType}`);
    return data;
  } catch (error) {
    console.error("Error fetching reports:", error.response?.data || error.message);
    throw error;
  }
};

const getActionLogs = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const { data } = await djangoAdminApiClient.get(`/admin/action-logs/?${params.toString()}`);
    return data;
  } catch (error) {
    console.error("Error fetching action logs:", error.response?.data || error.message);
    throw error;
  }
};

const getAllComplaints = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/complaints/');
    return data;
  } catch (error) {
    console.error("Error fetching complaints:", error.response?.data || error.message);
    throw error;
  }
};

const updateComplaint = async (complaintId, complaintData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/complaints/${complaintId}/`, complaintData);
    return data;
  } catch (error) {
    console.error("Error updating complaint:", error.response?.data || error.message);
    throw error;
  }
};

// Category CRUD operations
const getCategories = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/categories/');
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    throw error;
  }
};

const createCategory = async (categoryData) => {
  try {
    const { data } = await djangoAdminApiClient.post('/categories/', categoryData);
    return data;
  } catch (error) {
    console.error("Error creating category:", error.response?.data || error.message);
    throw error;
  }
};

const updateCategory = async (categoryId, categoryData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/categories/${categoryId}/`, categoryData);
    return data;
  } catch (error) {
    console.error("Error updating category:", error.response?.data || error.message);
    throw error;
  }
};

const deleteCategory = async (categoryId) => {
  try {
    await djangoAdminApiClient.delete(`/categories/${categoryId}/`);
  } catch (error) {
    console.error("Error deleting category:", error.response?.data || error.message);
    throw error;
  }
};

// Booking CRUD operations
const getBooking = async (bookingId) => {
  try {
    const { data } = await djangoAdminApiClient.get(`/bookings/${bookingId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error.response?.data || error.message);
    throw error;
  }
};

const updateBooking = async (bookingId, bookingData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/bookings/${bookingId}/`, bookingData);
    return data;
  } catch (error) {
    console.error("Error updating booking:", error.response?.data || error.message);
    throw error;
  }
};

const deleteBooking = async (bookingId) => {
  try {
    await djangoAdminApiClient.delete(`/bookings/${bookingId}/`);
  } catch (error) {
    console.error("Error deleting booking:", error.response?.data || error.message);
    throw error;
  }
};

// Review CRUD operations
const getAllReviews = async () => {
  try {
    const { data } = await djangoAdminApiClient.get('/reviews/');
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error.response?.data || error.message);
    throw error;
  }
};

const getReview = async (reviewId) => {
  try {
    const { data } = await djangoAdminApiClient.get(`/reviews/${reviewId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching review:", error.response?.data || error.message);
    throw error;
  }
};

const updateReview = async (reviewId, reviewData) => {
  try {
    const { data } = await djangoAdminApiClient.patch(`/reviews/${reviewId}/`, reviewData);
    return data;
  } catch (error) {
    console.error("Error updating review:", error.response?.data || error.message);
    throw error;
  }
};

const deleteReview = async (reviewId) => {
  try {
    await djangoAdminApiClient.delete(`/reviews/${reviewId}/`);
  } catch (error) {
    console.error("Error deleting review:", error.response?.data || error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    console.log('Calling logout endpoint: /django-admin/logout/');
    const { data } = await djangoAdminApiClient.post('/django-admin/logout/');
    console.log('Logout response:', data);
    return data;
  } catch (error) {
    console.error("Error logging out:", error.response?.data || error.message);
    console.error("Request config:", error.config);
    throw error;
  }
};

/**
 * Update current user (Django admin user's own profile)
 */
const updateCurrentUser = async (userData) => {
  try {
    const { data } = await djangoAdminApiClient.patch('/users/me/', userData);
    return data;
  } catch (error) {
    console.error("Error updating current user:", error.response?.data || error.message);
    throw error;
  }
};

export const djangoAdminService = {
  checkSession,
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  updateCurrentUser,
  logout,
};

