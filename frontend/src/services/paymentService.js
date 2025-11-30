import apiClient from '../api/apiClient';

/**
 * Creates a payment for a confirmed booking.
 * @param {object} paymentData - { booking, payment_method, amount }
 */
const createPayment = async (paymentData) => {
  try {
    const { data } = await apiClient.post('/payments/', paymentData);
    return data;
  } catch (error) {
    console.error("Error creating payment:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches payment details for a booking.
 * @param {string|number} paymentId - The ID of the payment.
 */
const getPayment = async (paymentId) => {
  try {
    const { data } = await apiClient.get(`/payments/${paymentId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching payment:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Provider sets payment number and method for a payment.
 * @param {number} paymentId - The ID of the payment.
 * @param {object} paymentDetails - { provider_payment_number, payment_method }
 */
const setProviderPaymentDetails = async (paymentId, paymentDetails) => {
  try {
    const { data } = await apiClient.post(`/payments/${paymentId}/provider-details/`, paymentDetails);
    return data;
  } catch (error) {
    console.error("Error setting provider payment details:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Seeker uploads payment screenshot.
 * @param {number} paymentId - The ID of the payment.
 * @param {File} screenshotFile - The screenshot file to upload.
 */
const uploadPaymentScreenshot = async (paymentId, screenshotFile) => {
  try {
    const formData = new FormData();
    formData.append('payment_screenshot', screenshotFile);
    
    const { data } = await apiClient.post(`/payments/${paymentId}/upload-screenshot/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error("Error uploading payment screenshot:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Admin verifies a payment.
 * @param {number} paymentId - The ID of the payment.
 * @param {object} verificationData - { action: 'approve' | 'reject', admin_notes?: string }
 */
const verifyPayment = async (paymentId, verificationData) => {
  try {
    const { data } = await apiClient.post(`/payments/${paymentId}/verify/`, verificationData);
    return data;
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get list of payments pending verification (Admin only).
 */
const getPendingVerifications = async () => {
  try {
    const { data } = await apiClient.get('/payments/pending-verification/');
    return data;
  } catch (error) {
    console.error("Error fetching pending verifications:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get list of payments for provider (Provider only).
 * @param {string} status - Optional status filter
 */
const getProviderPayments = async (status = null) => {
  try {
    const url = status ? `/payments/provider/?status=${status}` : '/payments/provider/';
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching provider payments:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get list of payments for seeker (Seeker only).
 * @param {string} status - Optional status filter
 */
const getSeekerPayments = async (status = null) => {
  try {
    const url = status ? `/payments/seeker/?status=${status}` : '/payments/seeker/';
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching seeker payments:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get list of all payments (Admin only).
 * @param {string} status - Optional status filter
 */
const getAdminPayments = async (status = null) => {
  try {
    const url = status ? `/payments/admin/?status=${status}` : '/payments/admin/';
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching admin payments:", error.response?.data || error.message);
    throw error;
  }
};

export const paymentService = {
  createPayment,
  getPayment,
  setProviderPaymentDetails,
  uploadPaymentScreenshot,
  verifyPayment,
  getPendingVerifications,
  getProviderPayments,
  getSeekerPayments,
  getAdminPayments,
};

