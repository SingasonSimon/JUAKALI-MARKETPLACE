import apiClient from '../api/apiClient';

/**
 * Creates a payment for a confirmed booking (dummy card payment).
 * @param {object} paymentData - { booking, card_number, payment_method }
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

export const paymentService = {
  createPayment,
  getPayment,
};

